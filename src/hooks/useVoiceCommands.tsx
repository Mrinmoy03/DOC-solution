import { useEffect, useRef, useState } from 'react';

type VoiceCommand = 
  | 'next-page' 
  | 'previous-page' 
  | 'zoom-in' 
  | 'zoom-out' 
  | 'scroll-up' 
  | 'scroll-down'
  | 'none';

interface UseVoiceCommandsReturn {
  listening: boolean;
  command: VoiceCommand;
  startListening: () => void;
  stopListening: () => void;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  start: () => void;
  stop: () => void;
  onresult: (event: any) => void;
  onerror: (event: any) => void;
  onend: (event: any) => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
    SpeechRecognition: new () => SpeechRecognition;
  }
}

export const useVoiceCommands = (): UseVoiceCommandsReturn => {
  const [listening, setListening] = useState(false);
  const [command, setCommand] = useState<VoiceCommand>('none');
  const recognitionRef = useRef<SpeechRecognition | null>(null);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      console.warn('Speech recognition not supported');
      return;
    }

    const SpeechRecognitionClass = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
    const recognition = new SpeechRecognitionClass();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = 'en-US';

    recognition.onresult = (event: any) => {
      if (event.results.length > 0) {
        const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase().trim();
        console.log('Voice command:', transcript);
        
        if (transcript.includes('next page') || transcript.includes('go to next page')) {
          setCommand('next-page');
        } else if (transcript.includes('previous page') || transcript.includes('go to previous page') || transcript.includes('go back')) {
          setCommand('previous-page');
        } else if (transcript.includes('zoom in')) {
          setCommand('zoom-in');
        } else if (transcript.includes('zoom out')) {
          setCommand('zoom-out');
        } else if (transcript.includes('scroll up')) {
          setCommand('scroll-up');
        } else if (transcript.includes('scroll down')) {
          setCommand('scroll-down');
        }
        
        setTimeout(() => setCommand('none'), 500);
      }
    };

    recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (event.error === 'no-speech' || event.error === 'aborted') {
        setListening(false);
      }
    };

    recognition.onend = () => {
      if (listening) {
        try {
          recognition.start();
        } catch (e) {
          setListening(false);
        }
      }
    };

    recognitionRef.current = recognition;

    return () => {
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch (e) {
          // Ignore errors on cleanup
        }
      }
    };
  }, [listening]);

  const startListening = () => {
    if (recognitionRef.current && !listening) {
      try {
        recognitionRef.current.start();
        setListening(true);
      } catch (error) {
        console.error('Failed to start voice recognition:', error);
      }
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && listening) {
      try {
        recognitionRef.current.stop();
        setListening(false);
      } catch (error) {
        console.error('Failed to stop voice recognition:', error);
      }
    }
  };

  return { listening, command, startListening, stopListening };
};
