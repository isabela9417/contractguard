import { Shield, History, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onHistoryClick: () => void;
  hasAnalysis: boolean;
}

export function Header({ onHistoryClick, hasAnalysis }: HeaderProps) {
  return (
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
              AI-Powered Contract Analysis
            </p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          {hasAnalysis && (
            <Button variant="ghost" size="sm" className="gap-2">
              <FileText className="h-4 w-4" />
              <span className="hidden sm:inline">Current Analysis</span>
            </Button>
          )}
          <Button 
            variant="outline" 
            size="sm" 
            className="gap-2"
            onClick={onHistoryClick}
          >
            <History className="h-4 w-4" />
            <span>History</span>
          </Button>
        </nav>
      </div>
    </header>
  );
}
