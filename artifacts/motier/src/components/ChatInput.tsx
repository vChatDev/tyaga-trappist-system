import { useState, useRef, useEffect } from "react";
import { Send, Sparkles } from "lucide-react";

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSubmit = () => {
    if (input.trim() && !disabled) {
      onSend(input.trim());
      setInput("");
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }
  }, [input]);

  return (
    <div className="relative w-full max-w-4xl mx-auto group">
      <div className="absolute -inset-0.5 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 rounded-2xl blur opacity-30 group-focus-within:opacity-100 transition duration-1000 group-focus-within:duration-200" />
      
      <div className="relative flex items-end bg-card border border-border/60 rounded-2xl shadow-xl overflow-hidden focus-within:border-primary/50 transition-colors duration-300">
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          placeholder="Present your inquiry to Dr. Motier..."
          className="w-full max-h-[200px] min-h-[60px] py-4 pl-5 pr-14 bg-transparent border-none resize-none focus:outline-none focus:ring-0 text-foreground placeholder:text-muted-foreground/60 text-[15px]"
          rows={1}
        />
        
        <div className="absolute right-2 bottom-2">
          <button
            onClick={handleSubmit}
            disabled={!input.trim() || disabled}
            className="p-2.5 rounded-xl bg-primary text-primary-foreground disabled:opacity-50 disabled:bg-muted disabled:text-muted-foreground transition-all duration-300 hover:shadow-[0_0_15px_rgba(0,255,255,0.4)] hover:scale-105 active:scale-95 flex items-center justify-center"
          >
            {disabled ? <Sparkles className="w-5 h-5 animate-pulse" /> : <Send className="w-5 h-5" />}
          </button>
        </div>
      </div>
      
      <div className="mt-2 text-center">
        <span className="text-[10px] text-muted-foreground/60 font-serif tracking-widest uppercase">
          Truth is forged in dialogue
        </span>
      </div>
    </div>
  );
}
