import { useState, useRef, useEffect } from 'react';
import { ChevronDown, AlertTriangle, Volume2, VolumeX, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FlaggedClause, RiskLevel } from '@/types/contract';
import { cn } from '@/lib/utils';

interface ClauseCardProps {
  clause: FlaggedClause;
  index: number;
  isPlaying: boolean;
  onPlayToggle: (clauseId: string) => void;
}

export function ClauseCard({ clause, index, isPlaying, onPlayToggle }: ClauseCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const riskStyles: Record<RiskLevel, { badge: string; border: string; icon: string }> = {
    low: {
      badge: 'risk-badge-low',
      border: 'border-l-risk-low',
      icon: 'text-risk-low',
    },
    medium: {
      badge: 'risk-badge-medium',
      border: 'border-l-risk-medium',
      icon: 'text-risk-medium',
    },
    high: {
      badge: 'risk-badge-high',
      border: 'border-l-risk-high',
      icon: 'text-risk-high',
    },
  };

  const styles = riskStyles[clause.riskLevel];

  const riskLabels: Record<RiskLevel, string> = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };

  return (
    <Card 
      className={cn(
        'border-l-4 transition-all duration-200 hover:shadow-md animate-slide-up',
        styles.border
      )}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <AlertTriangle className={cn('h-5 w-5 flex-shrink-0', styles.icon)} />
            <div>
              <h4 className="font-medium text-foreground">{clause.clauseType}</h4>
              <div className="flex items-center gap-2 mt-1">
                <Badge className={cn('text-xs', styles.badge)}>
                  {riskLabels[clause.riskLevel]}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Score: {clause.riskScore}/10
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onPlayToggle(clause.id)}
              title={isPlaying ? 'Stop reading' : 'Read aloud'}
            >
              {isPlaying ? (
                <VolumeX className="h-4 w-4" />
              ) : (
                <Volume2 className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronDown 
                className={cn(
                  'h-4 w-4 transition-transform duration-200',
                  isExpanded && 'rotate-180'
                )} 
              />
            </Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
          "{clause.text}"
        </p>

        {isExpanded && (
          <div className="mt-4 pt-4 border-t border-border space-y-4 animate-fade-in">
            <div>
              <h5 className="text-sm font-medium text-foreground mb-1">Why this matters:</h5>
              <p className="text-sm text-muted-foreground">{clause.explanation}</p>
            </div>
            <div>
              <h5 className="text-sm font-medium text-foreground mb-1">Recommendation:</h5>
              <p className="text-sm text-muted-foreground">{clause.suggestion}</p>
            </div>
            <div className="p-3 bg-muted/50 rounded-lg">
              <h5 className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">
                Original Text
              </h5>
              <p className="text-sm text-foreground italic">"{clause.text}"</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
