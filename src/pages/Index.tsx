import { useState } from 'react';
import { Header } from '@/components/Header';
import { UploadSection } from '@/components/UploadSection';
import { AnalysisResults } from '@/components/AnalysisResults';
import { HistoryPanel } from '@/components/HistoryPanel';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';

const Index = () => {
  const [historyOpen, setHistoryOpen] = useState(false);
  const {
    isAnalyzing,
    currentAnalysis,
    history,
    analyzeContract,
    loadAnalysis,
    deleteAnalysis,
    clearAnalysis,
  } = useContractAnalysis();

  const handleSelectAnalysis = (id: string) => {
    loadAnalysis(id);
    setHistoryOpen(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header 
        onHistoryClick={() => setHistoryOpen(true)} 
        hasAnalysis={!!currentAnalysis}
      />

      <main>
        {currentAnalysis ? (
          <AnalysisResults 
            analysis={currentAnalysis} 
            onNewAnalysis={clearAnalysis}
          />
        ) : (
          <UploadSection 
            onAnalyze={analyzeContract} 
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      <HistoryPanel
        isOpen={historyOpen}
        onClose={() => setHistoryOpen(false)}
        history={history}
        onSelectAnalysis={handleSelectAnalysis}
        onDeleteAnalysis={deleteAnalysis}
      />

      {/* Footer */}
      <footer className="border-t border-border py-6 mt-auto">
        <div className="container text-center text-sm text-muted-foreground">
          <p>ContractGuard AI • Empowering you to understand your contracts</p>
          <p className="mt-1 text-xs">
            This tool provides informational analysis only and is not a substitute for legal advice.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
