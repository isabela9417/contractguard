import { 
  Lightbulb, 
  MessageSquare, 
  AlertCircle, 
  Scale, 
  ArrowRight,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { NextSteps } from '@/types/contract';

interface NextStepsPanelProps {
  nextSteps: NextSteps;
}

export function NextStepsPanel({ nextSteps }: NextStepsPanelProps) {
  return (
    <Card className="mt-6 animate-slide-up border-primary/20 bg-gradient-to-br from-primary/5 to-transparent" style={{ animationDelay: '300ms' }}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-primary">
          <Lightbulb className="h-5 w-5" />
          Tips & Next Steps
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Immediate Actions */}
        {nextSteps.immediateActions && nextSteps.immediateActions.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <CheckCircle2 className="h-4 w-4 text-primary" />
              Immediate Actions
            </h4>
            <ul className="space-y-2">
              {nextSteps.immediateActions.map((action, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{action}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Negotiation Tips */}
        {nextSteps.negotiationTips && nextSteps.negotiationTips.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <Scale className="h-4 w-4 text-primary" />
              Negotiation Strategies
            </h4>
            <ul className="space-y-2">
              {nextSteps.negotiationTips.map((tip, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <ArrowRight className="h-4 w-4 text-primary mt-0.5 shrink-0" />
                  <span>{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Questions to Ask */}
        {nextSteps.questionsToAsk && nextSteps.questionsToAsk.length > 0 && (
          <div>
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-3">
              <MessageSquare className="h-4 w-4 text-primary" />
              Questions to Ask the Other Party
            </h4>
            <ul className="space-y-2">
              {nextSteps.questionsToAsk.map((question, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-primary font-medium shrink-0">Q{index + 1}:</span>
                  <span>{question}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Red Flags */}
        {nextSteps.redFlags && nextSteps.redFlags.length > 0 && nextSteps.redFlags[0] !== '' && (
          <div className="p-4 rounded-lg bg-risk-high-bg border border-risk-high/20">
            <h4 className="flex items-center gap-2 font-semibold text-risk-high mb-3">
              <AlertCircle className="h-4 w-4" />
              Red Flags to Consider
            </h4>
            <ul className="space-y-2">
              {nextSteps.redFlags.filter(rf => rf && rf.trim() !== '').map((flag, index) => (
                <li 
                  key={index}
                  className="flex items-start gap-2 text-sm text-risk-high"
                >
                  <span>⚠️</span>
                  <span>{flag}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Professional Advice */}
        {nextSteps.professionalAdvice && nextSteps.professionalAdvice.trim() !== '' && (
          <div className="p-4 rounded-lg bg-muted/50 border border-border">
            <h4 className="flex items-center gap-2 font-semibold text-foreground mb-2">
              <Scale className="h-4 w-4 text-primary" />
              When to Seek Professional Help
            </h4>
            <p className="text-sm text-muted-foreground">
              {nextSteps.professionalAdvice}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
