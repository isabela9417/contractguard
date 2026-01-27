import { X, FileText, Clock, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { AnalysisHistory } from '@/types/contract';
import { RiskScoreCircle } from './RiskScoreCircle';
import { cn } from '@/lib/utils';

interface HistoryPanelProps {
  isOpen: boolean;
  onClose: () => void;
  history: AnalysisHistory[];
  onSelectAnalysis: (id: string) => void;
  onDeleteAnalysis: (id: string) => void;
}

export function HistoryPanel({ 
  isOpen, 
  onClose, 
  history, 
  onSelectAnalysis, 
  onDeleteAnalysis 
}: HistoryPanelProps) {
  const contractTypeLabels: Record<string, string> = {
    employment: 'Employment',
    rental: 'Rental',
    service: 'Service',
    nda: 'NDA',
    sales: 'Sales',
    partnership: 'Partnership',
    freelance: 'Freelance',
    other: 'Other',
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          'fixed inset-0 bg-foreground/20 backdrop-blur-sm z-40 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Panel */}
      <div 
        className={cn(
          'fixed top-0 right-0 h-full w-full max-w-md bg-background border-l border-border shadow-xl z-50 transition-transform duration-300 ease-out',
          isOpen ? 'translate-x-0' : 'translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="font-serif text-xl font-semibold">Analysis History</h2>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>

        <ScrollArea className="h-[calc(100vh-65px)]">
          <div className="p-4">
            {history.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-muted mx-auto mb-4">
                  <Clock className="h-8 w-8 text-muted-foreground" />
                </div>
                <p className="text-muted-foreground">No analysis history yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Your analyzed contracts will appear here
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {history.map((item, index) => (
                  <div
                    key={item.id}
                    className="p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors cursor-pointer group animate-slide-up"
                    style={{ animationDelay: `${index * 50}ms` }}
                    onClick={() => onSelectAnalysis(item.id)}
                  >
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0">
                        <RiskScoreCircle score={item.overallRiskScore} size="sm" showLabel={false} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-medium text-foreground truncate">
                          {item.fileName}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {contractTypeLabels[item.contractType] || item.contractType}
                        </p>
                        <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.analyzedAt).toLocaleDateString()}</span>
                          <span>•</span>
                          <span>{item.clauseCount} clauses flagged</span>
                        </div>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8"
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteAnalysis(item.id);
                        }}
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </div>
    </>
  );
}
