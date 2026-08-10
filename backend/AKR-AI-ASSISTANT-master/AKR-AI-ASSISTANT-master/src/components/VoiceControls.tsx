import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, MicOff, Send, Globe } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface VoiceControlsProps {
  isListening: boolean;
  isSpeaking: boolean;
  onToggleListening: () => void;
  onSendMessage: (message: string) => void;
  onLanguageChange: (language: string) => void;
  disabled?: boolean;
}

const languages = [
  { code: 'en-US', name: 'English' },
  { code: 'ta-IN', name: 'தமிழ் (Tamil)' },
  { code: 'hi-IN', name: 'हिंदी (Hindi)' },
  { code: 'te-IN', name: 'తెలుగు (Telugu)' },
  { code: 'ml-IN', name: 'മലയാളം (Malayalam)' },
  { code: 'kn-IN', name: 'ಕನ್ನಡ (Kannada)' },
];

export const VoiceControls = ({
  isListening,
  isSpeaking,
  onToggleListening,
  onSendMessage,
  onLanguageChange,
  disabled = false,
}: VoiceControlsProps) => {
  const [textInput, setTextInput] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('en-US');

  const handleSendMessage = () => {
    if (textInput.trim()) {
      onSendMessage(textInput);
      setTextInput('');
    }
  };

  const handleLanguageChange = (value: string) => {
    setSelectedLanguage(value);
    onLanguageChange(value);
  };

  return (
    <div className="w-full max-w-2xl space-y-4">
      {/* Language Selector */}
      <div className="flex items-center justify-center gap-2">
        <Globe className="w-4 h-4 text-primary" />
        <Select value={selectedLanguage} onValueChange={handleLanguageChange}>
          <SelectTrigger className="w-48 bg-card/50 border-primary/30">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {languages.map((lang) => (
              <SelectItem key={lang.code} value={lang.code}>
                {lang.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Voice Button */}
      <div className="flex justify-center">
        <Button
          size="lg"
          onClick={onToggleListening}
          disabled={disabled || isSpeaking}
          className={cn(
            "w-20 h-20 rounded-full transition-all duration-300",
            isListening
              ? "bg-destructive hover:bg-destructive/90 shadow-neon-strong animate-pulse-glow"
              : "bg-gradient-primary hover:opacity-90 shadow-neon",
            disabled && "opacity-50 cursor-not-allowed"
          )}
        >
          {isListening ? (
            <MicOff className="w-8 h-8" />
          ) : (
            <Mic className="w-8 h-8" />
          )}
        </Button>
      </div>

      {/* Status Text */}
      <p className="text-center text-sm text-muted-foreground">
        {isListening
          ? "Listening... Click to stop"
          : isSpeaking
          ? "KIRA is speaking..."
          : "Click to start talking or type below"}
      </p>

      {/* Text Input */}
      <div className="flex gap-2">
        <Input
          type="text"
          placeholder="Type your message here..."
          value={textInput}
          onChange={(e) => setTextInput(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
          disabled={disabled || isListening || isSpeaking}
          className="flex-1 bg-card/50 border-primary/30 text-foreground placeholder:text-muted-foreground"
        />
        <Button
          onClick={handleSendMessage}
          disabled={!textInput.trim() || disabled || isListening || isSpeaking}
          className="bg-gradient-primary hover:opacity-90 shadow-neon"
        >
          <Send className="w-5 h-5" />
        </Button>
      </div>
    </div>
  );
};
