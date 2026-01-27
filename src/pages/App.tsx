import { useState } from 'react';
import { Shield, History, FileText, BarChart3 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UploadSection } from '@/components/UploadSection';
import { AnalysisResults } from '@/components/AnalysisResults';
import { HistoryPanel } from '@/components/HistoryPanel';
import { AnalyticsDashboard } from '@/components/AnalyticsDashboard';
import { useContractAnalysis } from '@/hooks/useContractAnalysis';
import { UserMenu } from '@/components/UserMenu';
import { Chatbot } from '@/components/Chatbot';

export default function AppPage() {
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'analyze' | 'analytics'>('analyze');
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
    setActiveTab('analyze');
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary">
              <Shield className="h-5 w-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="font-serif text-xl font-semibold tracking-tight text-foreground">
                ContractGuard
              </h1>
              <p className="text-xs text-muted-foreground">
                Contract Analysis Platform
              </p>
            </div>
          </div>

          <nav className="flex items-center gap-2">
            {currentAnalysis && (
              <Button variant="ghost" size="sm" className="gap-2" onClick={() => setActiveTab('analyze')}>
                <FileText className="h-4 w-4" />
                <span className="hidden sm:inline">Current Analysis</span>
              </Button>
            )}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setHistoryOpen(true)}
            >
              <History className="h-4 w-4" />
              <span>History</span>
            </Button>
            <UserMenu />
          </nav>
        </div>
      </header>

      <main className="container py-8">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
          <TabsList className="mb-6">
            <TabsTrigger value="analyze" className="gap-2">
              <FileText className="h-4 w-4" />
              Analyze
            </TabsTrigger>
            <TabsTrigger value="analytics" className="gap-2">
              <BarChart3 className="h-4 w-4" />
              Analytics
            </TabsTrigger>
          </TabsList>

          <TabsContent value="analyze" className="mt-0">
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
          </TabsContent>

          <TabsContent value="analytics" className="mt-0">
            <AnalyticsDashboard />
          </TabsContent>
        </Tabs>
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
          <p>ContractGuard • Empowering you to understand your contracts</p>
          <p className="mt-1 text-xs">
            This tool provides informational analysis only and is not a substitute for legal advice.
          </p>
        </div>
      </footer>

      {/* Chatbot */}
      <Chatbot />
    </div>
  );
}
