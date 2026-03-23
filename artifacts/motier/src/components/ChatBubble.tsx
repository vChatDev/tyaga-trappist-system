import { ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

interface ChatBubbleProps {
  role: "user" | "assistant" | "system";
  content: string;
  isStreaming?: boolean;
}

export function ChatBubble({ role, content, isStreaming }: ChatBubbleProps) {
  const isUser = role === "user";

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex w-full ${isUser ? "justify-end" : "justify-start"} mb-8`}
    >
      <div className={`flex max-w-[85%] md:max-w-[75%] gap-4 ${isUser ? "flex-row-reverse" : "flex-row"}`}>
        
        {/* Avatar Indicator */}
        <div className="flex-shrink-0 mt-1">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-secondary border border-secondary-foreground/20 flex items-center justify-center text-secondary-foreground text-xs font-serif shadow-lg">
              U
            </div>
          ) : (
            <div className={`w-10 h-10 rounded-full border border-primary/40 flex items-center justify-center overflow-hidden bg-background ${isStreaming ? 'animate-[pulse-glow_2s_ease-in-out_infinite]' : 'shadow-[0_0_10px_rgba(0,255,255,0.15)]'}`}>
              <img 
                src={`${import.meta.env.BASE_URL}images/motier-avatar.png`} 
                alt="Motier" 
                className="w-full h-full object-cover"
              />
            </div>
          )}
        </div>

        {/* Message Content */}
        <div 
          className={`
            relative px-5 py-4 rounded-2xl
            ${isUser 
              ? "bg-secondary/40 border border-secondary/50 text-foreground rounded-tr-sm" 
              : "bg-card border border-primary/20 text-foreground/90 rounded-tl-sm shadow-[0_4px_20px_-5px_rgba(0,0,0,0.5)]"
            }
          `}
        >
          {/* Subtle glow effect for Motier */}
          {!isUser && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />
          )}

          <div className={`relative z-10 ${isUser ? "whitespace-pre-wrap text-[15px]" : "markdown-body"}`}>
            {isUser ? (
              content
            ) : (
              <ReactMarkdown>
                {content}
              </ReactMarkdown>
            )}
            
            {isStreaming && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ repeat: Infinity, duration: 0.8, ease: "linear" }}
                className="inline-block w-2 h-4 ml-1 align-middle bg-primary/70"
              />
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
