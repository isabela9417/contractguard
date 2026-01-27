import { useState, useCallback, useEffect } from 'react';
import { ContractAnalysis, AnalysisHistory, UploadFormData, FlaggedClause, NextSteps } from '@/types/contract';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { extractTextFromPDF } from '@/lib/pdfParser';

// Read file as text
const readFileAsText = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        resolve(e.target.result as string);
      } else {
        reject(new Error('Failed to read file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

// Extract text from file based on type
const extractTextFromFile = async (file: File): Promise<{ text: string; pageCount: number }> => {
  const fileType = file.type;
  const fileName = file.name.toLowerCase();
  
  // For text-based files
  if (fileType === 'text/plain' || fileName.endsWith('.txt')) {
    const text = await readFileAsText(file);
    return { text, pageCount: Math.ceil(text.length / 3000) };
  }
  
  // For PDF files - use proper PDF.js extraction
  if (fileType === 'application/pdf' || fileName.endsWith('.pdf')) {
    const result = await extractTextFromPDF(file);
    console.log(`PDF extracted using ${result.method} method, ${result.pageCount} pages`);
    return { text: result.text, pageCount: result.pageCount };
  }
  
  // For DOCX, try to extract XML text content
  if (fileType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' || fileName.endsWith('.docx')) {
    try {
      const arrayBuffer = await file.arrayBuffer();
      const uint8Array = new Uint8Array(arrayBuffer);
      const decoder = new TextDecoder('utf-8', { fatal: false });
      const rawText = decoder.decode(uint8Array);
      
      // Extract text from XML tags
      const textContent = rawText
        .replace(/<[^>]+>/g, ' ')
        .replace(/[^\x20-\x7E\n\r]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      return { text: textContent.slice(0, 50000), pageCount: 1 };
    } catch (error) {
      console.error('Error extracting DOCX text:', error);
      return { text: '', pageCount: 0 };
    }
  }
  
  // For images, return a placeholder
  if (fileType.startsWith('image/')) {
    return { 
      text: '[Image file uploaded - OCR extraction would be needed for image-based contracts]', 
      pageCount: 1 
    };
  }
  
  // Default: try to read as text
  try {
    const text = await readFileAsText(file);
    return { text, pageCount: Math.ceil(text.length / 3000) };
  } catch {
    return { text: '', pageCount: 0 };
  }
};

interface AnalysisState {
  extractedText: string | null;
  analysisStep: 'idle' | 'extracting' | 'analyzing' | 'complete' | 'error';
}

export function useContractAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentAnalysis, setCurrentAnalysis] = useState<ContractAnalysis | null>(null);
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [analysisCache, setAnalysisCache] = useState<Record<string, ContractAnalysis>>({});
  const [analysisState, setAnalysisState] = useState<AnalysisState>({
    extractedText: null,
    analysisStep: 'idle',
  });
  const { toast } = useToast();
  const { user } = useAuth();

  // Fetch history from database
  const fetchHistory = useCallback(async () => {
    if (!user) {
      setHistory([]);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('contract_analyses')
        .select('id, file_name, contract_type, overall_risk_score, analyzed_at, flagged_clauses')
        .eq('user_id', user.id)
        .order('analyzed_at', { ascending: false })
        .limit(20);

      if (error) {
        console.error('Error fetching history:', error);
        return;
      }

      const historyItems: AnalysisHistory[] = (data || []).map((item) => ({
        id: item.id,
        fileName: item.file_name,
        contractType: item.contract_type as AnalysisHistory['contractType'],
        overallRiskScore: Number(item.overall_risk_score),
        analyzedAt: new Date(item.analyzed_at),
        clauseCount: Array.isArray(item.flagged_clauses) ? item.flagged_clauses.length : 0,
      }));

      setHistory(historyItems);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  }, [user]);

  useEffect(() => {
    fetchHistory();
  }, [fetchHistory]);

  const saveAnalysis = useCallback(async (analysis: Omit<ContractAnalysis, 'id'>): Promise<string | null> => {
    if (!user) return null;

    try {
      const insertData = {
        user_id: user.id,
        file_name: analysis.fileName,
        contract_type: analysis.contractType,
        user_role: analysis.userRole,
        jurisdiction: analysis.jurisdiction,
        overall_risk_score: analysis.overallRiskScore,
        summary: analysis.summary,
        flagged_clauses: analysis.flaggedClauses as unknown as Record<string, unknown>[],
        full_text: analysis.fullText,
        page_count: analysis.pageCount,
      };

      const { data, error } = await supabase
        .from('contract_analyses')
        .insert(insertData as any)
        .select('id')
        .single();

      if (error) {
        console.error('Error saving analysis:', error);
        return null;
      }

      return data.id;
    } catch (error) {
      console.error('Error saving analysis:', error);
      return null;
    }
  }, [user]);

  const analyzeContract = useCallback(async (data: UploadFormData) => {
    if (!data.file) {
      toast({
        title: 'No file selected',
        description: 'Please upload a contract to analyze.',
        variant: 'destructive',
      });
      return;
    }

    setIsAnalyzing(true);
    setAnalysisState({ extractedText: null, analysisStep: 'extracting' });

    try {
      // Step 1: Extract text from the file
      toast({
        title: 'Extracting text...',
        description: 'Reading your contract document.',
      });
      
      const { text: extractedText, pageCount } = await extractTextFromFile(data.file);
      
      if (!extractedText || extractedText.trim().length < 50) {
        throw new Error('Could not extract sufficient text from the document. Please try a different file format or ensure the PDF contains selectable text.');
      }

      setAnalysisState({ extractedText, analysisStep: 'analyzing' });
      
      toast({
        title: 'Analyzing contract...',
        description: 'Our AI is reviewing your contract for risky clauses.',
      });

      // Step 2: Send to AI for analysis
      const { data: analysisResult, error } = await supabase.functions.invoke('analyze-contract', {
        body: {
          contractText: extractedText,
          contractType: data.contractType,
          userRole: data.userRole,
          jurisdiction: data.jurisdiction,
        },
      });

      if (error) {
        throw new Error(error.message || 'Failed to analyze contract');
      }

      if (analysisResult.error) {
        throw new Error(analysisResult.error);
      }

      // Step 3: Process and save the analysis
      const flaggedClauses: FlaggedClause[] = (analysisResult.flaggedClauses || []).map((clause: any, index: number) => ({
        id: clause.id || `clause-${index + 1}`,
        text: clause.text || '',
        clauseType: clause.clauseType || 'Unknown',
        riskLevel: clause.riskLevel || 'medium',
        riskScore: typeof clause.riskScore === 'number' ? clause.riskScore : 5,
        explanation: clause.explanation || '',
        suggestion: clause.suggestion || '',
      }));

      // Process next steps if available
      const nextSteps: NextSteps | undefined = analysisResult.nextSteps ? {
        immediateActions: analysisResult.nextSteps.immediateActions || [],
        negotiationTips: analysisResult.nextSteps.negotiationTips || [],
        questionsToAsk: analysisResult.nextSteps.questionsToAsk || [],
        redFlags: analysisResult.nextSteps.redFlags || [],
        professionalAdvice: analysisResult.nextSteps.professionalAdvice || '',
      } : undefined;

      const analysisData: Omit<ContractAnalysis, 'id'> = {
        fileName: data.file.name,
        contractType: data.contractType,
        userRole: data.userRole,
        jurisdiction: data.jurisdiction || 'Not specified',
        uploadedAt: new Date(),
        analyzedAt: new Date(),
        overallRiskScore: typeof analysisResult.overallRiskScore === 'number' 
          ? Math.round(analysisResult.overallRiskScore * 10) / 10 
          : 5,
        summary: analysisResult.summary || 'Analysis complete. Review the flagged clauses below.',
        flaggedClauses,
        fullText: extractedText,
        pageCount: pageCount || Math.ceil(extractedText.length / 3000),
        nextSteps,
      };

      const id = await saveAnalysis(analysisData);

      if (!id) {
        throw new Error('Failed to save analysis');
      }

      const analysis: ContractAnalysis = { ...analysisData, id };
      setCurrentAnalysis(analysis);
      setAnalysisCache(prev => ({ ...prev, [id]: analysis }));
      setAnalysisState({ extractedText, analysisStep: 'complete' });
      await fetchHistory();

      toast({
        title: 'Analysis Complete',
        description: `Found ${analysis.flaggedClauses.length} clauses that need your attention.`,
      });
    } catch (error) {
      console.error('Analysis error:', error);
      setAnalysisState(prev => ({ ...prev, analysisStep: 'error' }));
      toast({
        title: 'Analysis Failed',
        description: error instanceof Error ? error.message : 'There was an error analyzing your contract. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsAnalyzing(false);
    }
  }, [saveAnalysis, fetchHistory, toast]);

  const loadAnalysis = useCallback(async (id: string) => {
    // Check cache first
    if (analysisCache[id]) {
      setCurrentAnalysis(analysisCache[id]);
      setAnalysisState({ 
        extractedText: analysisCache[id].fullText, 
        analysisStep: 'complete' 
      });
      return;
    }

    // Fetch from database
    try {
      const { data, error } = await supabase
        .from('contract_analyses')
        .select('*')
        .eq('id', id)
        .single();

      if (error || !data) {
        toast({
          title: 'Analysis not found',
          description: 'The analysis data is no longer available.',
          variant: 'destructive',
        });
        return;
      }

      const analysis: ContractAnalysis = {
        id: data.id,
        fileName: data.file_name,
        contractType: data.contract_type as ContractAnalysis['contractType'],
        userRole: data.user_role as ContractAnalysis['userRole'],
        jurisdiction: data.jurisdiction || 'Not specified',
        uploadedAt: new Date(data.created_at),
        analyzedAt: new Date(data.analyzed_at),
        overallRiskScore: Number(data.overall_risk_score),
        summary: data.summary,
        flaggedClauses: data.flagged_clauses as unknown as FlaggedClause[],
        fullText: data.full_text || '',
        pageCount: data.page_count || 1,
      };

      setCurrentAnalysis(analysis);
      setAnalysisCache(prev => ({ ...prev, [id]: analysis }));
      setAnalysisState({ extractedText: analysis.fullText, analysisStep: 'complete' });
    } catch (error) {
      console.error('Error loading analysis:', error);
      toast({
        title: 'Error loading analysis',
        description: 'Failed to load the analysis. Please try again.',
        variant: 'destructive',
      });
    }
  }, [analysisCache, toast]);

  const deleteAnalysis = useCallback(async (id: string) => {
    try {
      const { error } = await supabase
        .from('contract_analyses')
        .delete()
        .eq('id', id);

      if (error) {
        throw error;
      }

      setHistory(prev => prev.filter(h => h.id !== id));
      setAnalysisCache(prev => {
        const { [id]: _, ...rest } = prev;
        return rest;
      });

      if (currentAnalysis?.id === id) {
        setCurrentAnalysis(null);
        setAnalysisState({ extractedText: null, analysisStep: 'idle' });
      }

      toast({
        title: 'Analysis deleted',
        description: 'The analysis has been removed from your history.',
      });
    } catch (error) {
      console.error('Error deleting analysis:', error);
      toast({
        title: 'Error deleting analysis',
        description: 'Failed to delete the analysis. Please try again.',
        variant: 'destructive',
      });
    }
  }, [currentAnalysis, toast]);

  const clearAnalysis = useCallback(() => {
    setCurrentAnalysis(null);
    setAnalysisState({ extractedText: null, analysisStep: 'idle' });
  }, []);

  return {
    isAnalyzing,
    currentAnalysis,
    history,
    analysisState,
    analyzeContract,
    loadAnalysis,
    deleteAnalysis,
    clearAnalysis,
  };
}
