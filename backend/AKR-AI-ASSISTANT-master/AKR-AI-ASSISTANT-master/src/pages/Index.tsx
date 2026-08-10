import { useState, useRef, useEffect } from 'react';
import { KiraOrb } from '@/components/KiraOrb';
import { ChatMessage } from '@/components/ChatMessage';
import { VoiceControls } from '@/components/VoiceControls';
import { VoiceRecognition, VoiceSynthesis } from '@/lib/voiceRecognition';
import { findResponse } from '@/lib/kiraMemory';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const Index = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [currentLanguage, setCurrentLanguage] = useState('en-US');
  
  const voiceRecognition = useRef<VoiceRecognition>(new VoiceRecognition());
  const voiceSynthesis = useRef<VoiceSynthesis>(new VoiceSynthesis());
  const { toast } = useToast();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (!voiceRecognition.current.isSupported()) {
      toast({
        title: "Speech Recognition Not Supported",
        description: "Your browser doesn't support speech recognition. Please use Chrome, Edge, or Safari.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    // Auto-scroll to bottom when new messages arrive
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleUserMessage = (userInput: string) => {
    // Stop speaking if KIRA is currently speaking
    if (isSpeaking) {
      voiceSynthesis.current.stop();
      setIsSpeaking(false);
    }

    // Add user message
    const userMessage: Message = {
      id: `user-${Date.now()}`,
      role: 'user',
      content: userInput,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);

    // Find response from memory
    const response = findResponse(userInput);

    // Add assistant message
    const assistantMessage: Message = {
      id: `assistant-${Date.now()}`,
      role: 'assistant',
      content: response,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, assistantMessage]);

    // Speak the response
    setIsSpeaking(true);
    voiceSynthesis.current.speak(response, currentLanguage, () => {
      setIsSpeaking(false);
    });
  };

  const handleToggleListening = () => {
    if (isListening) {
      voiceRecognition.current.stop();
      setIsListening(false);
    } else {
      voiceRecognition.current.start(
        (transcript: string) => {
          if (transcript) {
            handleUserMessage(transcript);
            voiceRecognition.current.stop();
            setIsListening(false);
          }
        },
        () => {
          setIsListening(false);
        },
        (error: string) => {
          setIsListening(false);
          toast({
            title: "Voice Recognition Error",
            description: error,
            variant: "destructive",
          });
        }
      );
      setIsListening(true);
    }
  };

  const handleLanguageChange = (language: string) => {
    setCurrentLanguage(language);
    voiceRecognition.current.setLanguage(language);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-between p-4 md:p-8 overflow-hidden relative">
      {/* Animated background grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] opacity-20" />
      
      <div className="w-full max-w-6xl flex flex-col items-center gap-8 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2 animate-fade-in">
          <h1 className="text-5xl md:text-7xl font-bold bg-gradient-primary bg-clip-text text-transparent drop-shadow-[0_0_20px_hsl(var(--primary)/0.5)]">
            KIRA
          </h1>
          <p className="text-muted-foreground text-lg">
            Your Intelligent Voice Assistant
          </p>
        </div>

        {/* Main Content */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          {/* Left Side - Orb */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="relative w-full max-w-md aspect-square flex items-center justify-center">
              <KiraOrb
                isListening={isListening}
                isSpeaking={isSpeaking}
                className="w-full h-full"
              />
            </div>
            
            <VoiceControls
              isListening={isListening}
              isSpeaking={isSpeaking}
              onToggleListening={handleToggleListening}
              onSendMessage={handleUserMessage}
              onLanguageChange={handleLanguageChange}
              disabled={!voiceRecognition.current.isSupported()}
            />
          </div>

          {/* Right Side - Chat History */}
          <div className="w-full h-[600px] bg-card/30 backdrop-blur-md rounded-2xl border border-primary/20 shadow-neon overflow-hidden">
            <div className="p-4 border-b border-primary/20 bg-card/50">
              <h2 className="text-lg font-semibold text-foreground">Conversation</h2>
              <p className="text-sm text-muted-foreground">
                {messages.length === 0
                  ? "Start a conversation with KIRA"
                  : `${messages.length} messages`}
              </p>
            </div>
            
            <ScrollArea className="h-[calc(100%-80px)] p-4">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-12">
                    <p>Say "Call KIRA" or click the microphone to begin</p>
                  </div>
                ) : (
                  messages.map((message) => (
                    <ChatMessage key={message.id} {...message} />
                  ))
                )}
                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          </div>
        </div>

        {/* Footer Info */}
        <div className="text-center space-y-2 text-sm text-muted-foreground animate-fade-in">
          <p>Created by Arikaran R | AI & Data Science Engineer</p>
          <p className="text-xs">
            Powered by Web Speech API • Real-time Voice Recognition • Multi-language Support
          </p>
        </div>
      </div>
    </div>
  );
};

export default Index;
