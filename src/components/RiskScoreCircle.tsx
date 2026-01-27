import { cn } from '@/lib/utils';

interface RiskScoreCircleProps {
  score: number; // 0-10
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export function RiskScoreCircle({ score, size = 'md', showLabel = true }: RiskScoreCircleProps) {
  const normalizedScore = Math.max(0, Math.min(10, score));
  const percentage = (normalizedScore / 10) * 100;
  
  const sizeClasses = {
    sm: 'h-16 w-16',
    md: 'h-24 w-24',
    lg: 'h-32 w-32',
  };

  const strokeWidth = size === 'sm' ? 6 : size === 'md' ? 8 : 10;
  const radius = size === 'sm' ? 24 : size === 'md' ? 40 : 54;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  const getColor = () => {
    if (normalizedScore <= 3) return { stroke: 'hsl(var(--risk-low))', text: 'text-risk-low', label: 'Low Risk' };
    if (normalizedScore <= 6) return { stroke: 'hsl(var(--risk-medium))', text: 'text-risk-medium', label: 'Medium Risk' };
    return { stroke: 'hsl(var(--risk-high))', text: 'text-risk-high', label: 'High Risk' };
  };

  const { stroke, text, label } = getColor();

  return (
    <div className="flex flex-col items-center gap-2">
      <div className={cn('relative', sizeClasses[size])}>
        <svg className="w-full h-full -rotate-90" viewBox={`0 0 ${(radius + strokeWidth) * 2} ${(radius + strokeWidth) * 2}`}>
          {/* Background circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={radius + strokeWidth}
            cy={radius + strokeWidth}
            r={radius}
            fill="none"
            stroke={stroke}
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="transition-all duration-1000 ease-out"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className={cn(
            'font-semibold',
            text,
            size === 'sm' ? 'text-lg' : size === 'md' ? 'text-2xl' : 'text-3xl'
          )}>
            {normalizedScore.toFixed(1)}
          </span>
        </div>
      </div>
      {showLabel && (
        <span className={cn('text-sm font-medium', text)}>{label}</span>
      )}
    </div>
  );
}
