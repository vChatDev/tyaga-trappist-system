import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export interface LogEntry {
  id: string;
  time: string;
  msg: string;
  type: 'info' | 'warn' | 'system' | 'event';
}

export function TerminalLog() {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string, type: LogEntry['type'] = 'info') => {
    const time = new Date().toLocaleTimeString('en-US', { 
      hour12: false, 
      hour: '2-digit', 
      minute: '2-digit', 
      second: '2-digit', 
      fractionalSecondDigits: 3 
    });
    setLogs(prev => [...prev.slice(-49), { id: Math.random().toString(36).substr(2, 9), time, msg, type }]);
  };

  useEffect(() => {
    // Initial boot sequence log
    setTimeout(() => addLog('SYS.INIT // Agent Alpha core online.', 'system'), 300);
    setTimeout(() => addLog('Memory verified. Listening for native events.', 'system'), 800);

    const handleTrigger = (e: Event) => {
      const customEvent = e as CustomEvent;
      addLog(`Event Dispatched [AgentAlpha:trigger] -> MODE: ${customEvent.detail.mode}`, 'event');
    };

    const handleIdlePing = () => {
      addLog('Event Dispatched [AgentAlpha:idlePing] -> AWAITING INTERACTION', 'warn');
    };

    window.addEventListener('AgentAlpha:trigger', handleTrigger);
    window.addEventListener('AgentAlpha:idlePing', handleIdlePing);

    return () => {
      window.removeEventListener('AgentAlpha:trigger', handleTrigger);
      window.removeEventListener('AgentAlpha:idlePing', handleIdlePing);
    };
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs]);

  const getColor = (type: string) => {
    switch(type) {
      case 'warn': return 'text-amber-500';
      case 'event': return 'text-emerald-400';
      case 'system': return 'text-cyan-500';
      default: return 'text-muted-foreground';
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mt-8 border border-border/50 bg-black/60 backdrop-blur-md rounded-lg overflow-hidden flex flex-col h-64 shadow-2xl relative">
      <div className="bg-white/5 border-b border-white/10 px-4 py-2 flex items-center justify-between z-10 relative">
        <div className="flex space-x-2">
          <div className="w-3 h-3 rounded-full bg-rose-500/50" />
          <div className="w-3 h-3 rounded-full bg-amber-500/50" />
          <div className="w-3 h-3 rounded-full bg-emerald-500/50" />
        </div>
        <span className="font-mono text-xs text-muted-foreground/60 tracking-widest uppercase">
          SYS.LOG // EVENT_LISTENER
        </span>
      </div>
      
      <div ref={scrollRef} className="p-4 font-mono text-sm space-y-1 overflow-y-auto flex-1 custom-scrollbar">
        <AnimatePresence initial={false}>
          {logs.map((log) => (
            <motion.div 
              key={log.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className={`flex space-x-4 ${getColor(log.type)}`}
            >
              <span className="text-white/30 shrink-0">[{log.time}]</span>
              <span className="break-words">{log.msg}</span>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
      
      {/* subtle scanline over terminal */}
      <div className="absolute inset-0 scanlines opacity-50 z-0 pointer-events-none" />
    </div>
  );
}
