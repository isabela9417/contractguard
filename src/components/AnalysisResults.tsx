import { useState, useRef } from 'react';
import { FileText, Download, ChevronDown, Shield, AlertTriangle, CheckCircle, FileDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ContractAnalysis } from '@/types/contract';
import { RiskScoreCircle } from './RiskScoreCircle';
import { ClauseCard } from './ClauseCard';
import { TextPreview } from './TextPreview';
import { NextStepsPanel } from './NextStepsPanel';
import { VoiceAccessibility } from './VoiceAccessibility';
import { generatePDFReport, downloadAsWord } from '@/lib/pdfExport';
import { cn } from '@/lib/utils';

interface AnalysisResultsProps {
  analysis: ContractAnalysis;
  onNewAnalysis: () => void;
}

export function AnalysisResults({ analysis, onNewAnalysis }: AnalysisResultsProps) {
  const [exportOpen, setExportOpen] = useState(false);
  const [playingClauseId, setPlayingClauseId] = useState<string | null>(null);
  const speechRef = useRef<SpeechSynthesisUtterance | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const highRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'high');
  const mediumRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'medium');
  const lowRiskClauses = analysis.flaggedClauses.filter(c => c.riskLevel === 'low');

  const handlePlayToggle = (clauseId: string) => {
    if (speechSynthesis.speaking) {
      speechSynthesis.cancel();
    }

    if (playingClauseId === clauseId) {
      setPlayingClauseId(null);
      return;
    }

    const clause = analysis.flaggedClauses.find(c => c.id === clauseId);
    if (clause) {
      const text = `${clause.clauseType}. Risk level: ${clause.riskLevel}. ${clause.explanation}. Recommendation: ${clause.suggestion}`;
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.onend = () => setPlayingClauseId(null);
      utterance.onerror = () => setPlayingClauseId(null);
      speechRef.current = utterance;
      setPlayingClauseId(clauseId);
      speechSynthesis.speak(utterance);
    }
  };

  const handleExport = (format: 'pdf' | 'docx') => {
    setExportOpen(false);
    
    if (format === 'pdf') {
      generatePDFReport(analysis, { includeNextSteps: true });
    } else {
      downloadAsWord(analysis);
    }
  };

  // Generate summary text for voice accessibility
  const summaryText = `Analysis of ${analysis.fileName}. Overall risk score: ${analysis.overallRiskScore} out of 10. ${analysis.summary}. Found ${analysis.flaggedClauses.length} flagged clauses: ${highRiskClauses.length} high risk, ${mediumRiskClauses.length} medium risk, and ${lowRiskClauses.length} low risk.`;

  return (
    <section className="py-4 md:py-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 animate-fade-in">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="font-serif text-2xl font-semibold text-foreground">
                {analysis.fileName}
              </h2>
              <p className="text-sm text-muted-foreground">
                Analyzed {new Date(analysis.analyzedAt).toLocaleString()}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <VoiceAccessibility text={summaryText} label="Listen to Summary" />
            
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={onNewAnalysis}>
                Analyze Another
              </Button>
              
              <div className="relative" ref={dropdownRef}>
                <Button 
                  className="gap-2 gradient-primary"
                  onClick={() => setExportOpen(!exportOpen)}
                >
                  <Download className="h-4 w-4" />
                  Export Analysis
                  <ChevronDown className={cn(
                    'h-4 w-4 transition-transform',
                    exportOpen && 'rotate-180'
                  )} />
                </Button>
                
                {exportOpen && (
                  <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-card shadow-xl z-[100] animate-scale-in">
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm bg-card hover:bg-muted transition-colors rounded-t-lg"
                      onClick={() => handleExport('pdf')}
                    >
                      <FileDown className="h-4 w-4 text-destructive" />
                      <div className="text-left">
                        <p className="font-medium">Export as PDF</p>
                        <p className="text-xs text-muted-foreground">Full formatted report</p>
                      </div>
                    </button>
                    <button
                      className="flex w-full items-center gap-3 px-4 py-3 text-sm bg-card hover:bg-muted transition-colors rounded-b-lg border-t border-border"
                      onClick={() => handleExport('docx')}
                    >
                      <FileText className="h-4 w-4 text-primary" />
                      <div className="text-left">
                        <p className="font-medium">Export as DOCX</p>
                        <p className="text-xs text-muted-foreground">Editable document</p>
                      </div>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Text Preview */}
        {analysis.fullText && analysis.fullText.length > 0 && (
          <TextPreview text={analysis.fullText} fileName={analysis.fileName} />
        )}

        {/* Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card className="md:col-span-1 animate-slide-up">
            <CardContent className="p-6 flex flex-col items-center justify-center">
              <RiskScoreCircle score={analysis.overallRiskScore} size="lg" />
            </CardContent>
          </Card>

          <Card className="md:col-span-3 animate-slide-up" style={{ animationDelay: '100ms' }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg font-medium">Analysis Summary</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{analysis.summary}</p>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="flex items-center gap-2 p-3 rounded-lg bg-risk-high-bg">
                  <AlertTriangle className="h-5 w-5 text-risk-high" />
                  <div>
                    <p className="text-2xl font-semibold text-risk-high">{highRiskClauses.length}</p>
                    <p className="text-xs text-muted-foreground">High Risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-risk-medium-bg">
                  <AlertTriangle className="h-5 w-5 text-risk-medium" />
                  <div>
                    <p className="text-2xl font-semibold text-risk-medium">{mediumRiskClauses.length}</p>
                    <p className="text-xs text-muted-foreground">Medium Risk</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded-lg bg-risk-low-bg">
                  <CheckCircle className="h-5 w-5 text-risk-low" />
                  <div>
                    <p className="text-2xl font-semibold text-risk-low">{lowRiskClauses.length}</p>
                    <p className="text-xs text-muted-foreground">Low Risk</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Flagged Clauses */}
        <Card className="animate-slide-up" style={{ animationDelay: '200ms' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Flagged Clauses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="all" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="all">
                  All ({analysis.flaggedClauses.length})
                </TabsTrigger>
                <TabsTrigger value="high" className="text-risk-high data-[state=active]:text-risk-high">
                  High ({highRiskClauses.length})
                </TabsTrigger>
                <TabsTrigger value="medium" className="text-risk-medium data-[state=active]:text-risk-medium">
                  Medium ({mediumRiskClauses.length})
                </TabsTrigger>
                <TabsTrigger value="low" className="text-risk-low data-[state=active]:text-risk-low">
                  Low ({lowRiskClauses.length})
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all" className="space-y-3">
                {analysis.flaggedClauses.map((clause, index) => (
                  <ClauseCard 
                    key={clause.id} 
                    clause={clause} 
                    index={index}
                    isPlaying={playingClauseId === clause.id}
                    onPlayToggle={handlePlayToggle}
                  />
                ))}
              </TabsContent>

              <TabsContent value="high" className="space-y-3">
                {highRiskClauses.map((clause, index) => (
                  <ClauseCard 
                    key={clause.id} 
                    clause={clause} 
                    index={index}
                    isPlaying={playingClauseId === clause.id}
                    onPlayToggle={handlePlayToggle}
                  />
                ))}
              </TabsContent>

              <TabsContent value="medium" className="space-y-3">
                {mediumRiskClauses.map((clause, index) => (
                  <ClauseCard 
                    key={clause.id} 
                    clause={clause} 
                    index={index}
                    isPlaying={playingClauseId === clause.id}
                    onPlayToggle={handlePlayToggle}
                  />
                ))}
              </TabsContent>

              <TabsContent value="low" className="space-y-3">
                {lowRiskClauses.map((clause, index) => (
                  <ClauseCard 
                    key={clause.id} 
                    clause={clause} 
                    index={index}
                    isPlaying={playingClauseId === clause.id}
                    onPlayToggle={handlePlayToggle}
                  />
                ))}
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>

        {/* Next Steps and Tips Panel */}
        {analysis.nextSteps && (
          <NextStepsPanel nextSteps={analysis.nextSteps} />
        )}
      </div>
    </section>
  );
}
