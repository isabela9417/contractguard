import { useState } from 'react';
import { ChevronDown, ChevronUp, FileText, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface TextPreviewProps {
  text: string;
  fileName: string;
}

export function TextPreview({ text, fileName }: TextPreviewProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const previewLength = 500;
  const hasMore = text.length > previewLength;
  const displayText = isExpanded ? text : text.slice(0, previewLength);
  const wordCount = text.split(/\s+/).filter(Boolean).length;
  const charCount = text.length;

  const handleCopy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="animate-slide-up mb-6">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-lg">
            <FileText className="h-5 w-5" />
            Extracted Text
          </CardTitle>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {wordCount.toLocaleString()} words • {charCount.toLocaleString()} characters
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleCopy}
              className="gap-1.5"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  Copied
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  Copy
                </>
              )}
            </Button>
          </div>
        </div>
        <p className="text-sm text-muted-foreground">
          Text extracted from: <span className="font-medium">{fileName}</span>
        </p>
      </CardHeader>
      <CardContent>
        <ScrollArea className={cn(
          "rounded-lg border bg-muted/30 p-4 transition-all",
          isExpanded ? "max-h-96" : "max-h-40"
        )}>
          <pre className="text-sm text-foreground whitespace-pre-wrap font-sans leading-relaxed">
            {displayText}
            {!isExpanded && hasMore && (
              <span className="text-muted-foreground">...</span>
            )}
          </pre>
        </ScrollArea>
        
        {hasMore && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full gap-2"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4" />
                Show Less
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4" />
                Show Full Text ({Math.round(text.length / 1000)}k characters)
              </>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
