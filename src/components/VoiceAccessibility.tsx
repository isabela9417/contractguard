import { useState, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Mic, MicOff } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VoiceAccessibilityProps {
  text: string;
  label?: string;
}

export function VoiceAccessibility({ text, label = "Read aloud" }: VoiceAccessibilityProps) {
  const [isPlaying, setIsPlaying] = useState(false);

  const togglePlayback = useCallback(() => {
    if (isPlaying) {
      speechSynthesis.cancel();
      setIsPlaying(false);
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = () => setIsPlaying(false);
    
    setIsPlaying(true);
    speechSynthesis.speak(utterance);
  }, [text, isPlaying]);

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={togglePlayback}
      className="gap-2"
    >
      {isPlaying ? (
        <>
          <VolumeX className="h-4 w-4" />
          Stop
        </>
      ) : (
        <>
          <Volume2 className="h-4 w-4" />
          {label}
        </>
      )}
    </Button>
  );
}

// Hook for speech-to-text
export function useSpeechToText() {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const recognitionRef = useRef<any>(null);

  const startListening = useCallback(() => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    
    if (!SpeechRecognitionAPI) {
      console.error('Speech recognition not supported');
      return;
    }

    const recognition = new SpeechRecognitionAPI();
    
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onresult = (event) => {
      let finalTranscript = '';
      for (let i = event.resultIndex; i < event.results.length; i++) {
        if (event.results[i].isFinal) {
          finalTranscript += event.results[i][0].transcript;
        }
      }
      if (finalTranscript) {
        setTranscript(prev => prev + ' ' + finalTranscript);
      }
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error:', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, []);

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
    setIsListening(false);
  }, []);

  const clearTranscript = useCallback(() => {
    setTranscript('');
  }, []);

  return {
    isListening,
    transcript,
    startListening,
    stopListening,
    clearTranscript,
  };
}

// Speech to Text Button Component
export function SpeechToTextButton({ 
  onTranscript 
}: { 
  onTranscript: (text: string) => void 
}) {
  const { isListening, transcript, startListening, stopListening, clearTranscript } = useSpeechToText();

  const handleToggle = () => {
    if (isListening) {
      stopListening();
      if (transcript.trim()) {
        onTranscript(transcript.trim());
        clearTranscript();
      }
    } else {
      clearTranscript();
      startListening();
    }
  };

  return (
    <Button
      variant={isListening ? "destructive" : "outline"}
      size="icon"
      onClick={handleToggle}
      title={isListening ? "Stop listening" : "Start voice input"}
    >
      {isListening ? (
        <MicOff className="h-4 w-4 animate-pulse" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
