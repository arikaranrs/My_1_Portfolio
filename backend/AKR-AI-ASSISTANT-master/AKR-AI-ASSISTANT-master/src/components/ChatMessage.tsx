import { cn } from '@/lib/utils';
import { User, Bot } from 'lucide-react';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export const ChatMessage = ({ role, content, timestamp }: ChatMessageProps) => {
  const isUser = role === 'user';

  return (
    <div
      className={cn(
        "flex gap-3 items-start animate-fade-in",
        isUser ? "flex-row-reverse" : "flex-row"
      )}
    >
      <div
        className={cn(
          "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
          isUser
            ? "bg-gradient-accent"
            : "bg-gradient-primary shadow-neon"
        )}
      >
        {isUser ? (
          <User className="w-5 h-5 text-foreground" />
        ) : (
          <Bot className="w-5 h-5 text-primary-foreground" />
        )}
      </div>

      <div
        className={cn(
          "flex flex-col gap-1 max-w-[80%]",
          isUser ? "items-end" : "items-start"
        )}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-2xl backdrop-blur-sm",
            isUser
              ? "bg-muted/50 border border-border/50"
              : "bg-card/50 border border-primary/30 shadow-neon"
          )}
        >
          <p className="text-sm text-foreground leading-relaxed">{content}</p>
        </div>
        
        <span className="text-xs text-muted-foreground px-2">
          {timestamp.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit' 
          })}
        </span>
      </div>
    </div>
  );
};
