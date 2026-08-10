// Voice Recognition using Web Speech API
// Type declarations for Web Speech API
interface SpeechRecognitionEvent extends Event {
  readonly resultIndex: number;
  readonly results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
  readonly length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
  readonly length: number;
  readonly isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
  readonly transcript: string;
  readonly confidence: number;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: ((event: SpeechRecognitionEvent) => void) | null;
  onend: (() => void) | null;
  onerror: ((event: any) => void) | null;
  start(): void;
  stop(): void;
  abort(): void;
}

declare global {
  interface Window {
    SpeechRecognition: new () => SpeechRecognition;
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

export class VoiceRecognition {
  private recognition: SpeechRecognition | null = null;
  private isListening = false;
  private onResultCallback: ((transcript: string) => void) | null = null;
  private onEndCallback: (() => void) | null = null;
  private onErrorCallback: ((error: string) => void) | null = null;
  private currentLanguage = 'en-US';

  constructor() {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognitionAPI = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      this.recognition = new SpeechRecognitionAPI();
      this.setupRecognition();
    }
  }

  private setupRecognition() {
    if (!this.recognition) return;

    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = this.currentLanguage;

    this.recognition.onresult = (event: SpeechRecognitionEvent) => {
      let finalTranscript = '';
      
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        
        if (event.results[i].isFinal) {
          finalTranscript += transcript + ' ';
        }
      }

      if (finalTranscript && this.onResultCallback) {
        this.onResultCallback(finalTranscript.trim());
      }
    };

    this.recognition.onend = () => {
      this.isListening = false;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.recognition.onerror = (event: any) => {
      console.error('Speech recognition error:', event.error);
      if (this.onErrorCallback) {
        this.onErrorCallback(event.error);
      }
    };
  }

  setLanguage(language: string) {
    this.currentLanguage = language;
    if (this.recognition) {
      this.recognition.lang = language;
    }
  }

  start(
    onResult: (transcript: string) => void,
    onEnd?: () => void,
    onError?: (error: string) => void
  ) {
    if (!this.recognition) {
      const error = 'Speech recognition not supported in this browser';
      console.error(error);
      if (onError) onError(error);
      return;
    }

    this.onResultCallback = onResult;
    this.onEndCallback = onEnd || null;
    this.onErrorCallback = onError || null;

    try {
      this.recognition.start();
      this.isListening = true;
    } catch (error) {
      console.error('Error starting recognition:', error);
      if (this.onErrorCallback) {
        this.onErrorCallback('Failed to start listening');
      }
    }
  }

  stop() {
    if (this.recognition && this.isListening) {
      this.recognition.stop();
      this.isListening = false;
    }
  }

  getIsListening() {
    return this.isListening;
  }

  isSupported() {
    return this.recognition !== null;
  }
}

// Voice Synthesis using Web Speech API
export class VoiceSynthesis {
  private synth: SpeechSynthesis;
  private isSpeaking = false;
  private currentUtterance: SpeechSynthesisUtterance | null = null;

  constructor() {
    this.synth = window.speechSynthesis;
  }

  speak(text: string, language = 'en-US', onEnd?: () => void) {
    if (this.isSpeaking) {
      this.stop();
    }

    this.currentUtterance = new SpeechSynthesisUtterance(text);
    this.currentUtterance.lang = language;
    this.currentUtterance.rate = 1.0;
    this.currentUtterance.pitch = 1.0;
    this.currentUtterance.volume = 1.0;

    this.currentUtterance.onstart = () => {
      this.isSpeaking = true;
    };

    this.currentUtterance.onend = () => {
      this.isSpeaking = false;
      if (onEnd) onEnd();
    };

    this.currentUtterance.onerror = (event) => {
      console.error('Speech synthesis error:', event);
      this.isSpeaking = false;
    };

    this.synth.speak(this.currentUtterance);
  }

  stop() {
    this.synth.cancel();
    this.isSpeaking = false;
    this.currentUtterance = null;
  }

  getIsSpeaking() {
    return this.isSpeaking;
  }

  pause() {
    if (this.isSpeaking) {
      this.synth.pause();
    }
  }

  resume() {
    if (this.isSpeaking) {
      this.synth.resume();
    }
  }
}
