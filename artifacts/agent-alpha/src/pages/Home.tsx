import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hammer, Moon, Zap, AlertTriangle, Activity } from 'lucide-react';
import { playTone } from '@/lib/audio';
import { TerminalLog } from '@/components/TerminalLog';

type Mode = 'BUILD' | 'ESCAPE' | 'BLOW UP';
const MODES: Mode[] = ['BUILD', 'ESCAPE', 'BLOW UP'];

const MODE_CONFIG: Record<Mode, any> = {
  'BUILD': {
    color: 'text-emerald-500',
    border: 'border-emerald-500',
    bg: 'bg-emerald-500',
    glow: 'shadow-[0_0_40px_rgba(16,185,129,0.25)]',
    bgGlow: 'from-emerald-950/30',
    freq: 660,
    icon: Hammer,
    desc: 'ACTIVE CREATIVE WORK',
  },
  'ESCAPE': {
    color: 'text-amber-500',
    border: 'border-amber-500',
    bg: 'bg-amber-500',
    glow: 'shadow-[0_0_40px_rgba(245,158,11,0.25)]',
    bgGlow: 'from-amber-950/30',
    freq: 440,
    icon: Moon,
    desc: 'STANDBY & RESET',
  },
  'BLOW UP': {
    color: 'text-rose-500',
    border: 'border-rose-500',
    bg: 'bg-rose-500',
    glow: 'shadow-[0_0_40px_rgba(225,29,72,0.25)]',
    bgGlow: 'from-rose-950/30',
    freq: 220,
    icon: Zap,
    desc: 'CRITICAL ENERGY BURST',
  }
};

const IDLE_TIMEOUT_MS = 10 * 60 * 1000; // 10 minutes

export default function Home() {
  const [mode, setMode] = useState<Mode>(() => {
    return (localStorage.getItem('agentalpha.mode') as Mode) || 'BUILD';
  });
  const [idleWarning, setIdleWarning] = useState(false);
  const idleRef = useRef<NodeJS.Timeout | null>(null);

  // Initialize idle timer
  useEffect(() => {
    function resetIdle() {
      setIdleWarning(false);
      if (idleRef.current) clearTimeout(idleRef.current);
      
      idleRef.current = setTimeout(() => {
        // Idle Ping
        playTone(880, 0.6);
        window.dispatchEvent(new CustomEvent('AgentAlpha:idlePing'));
        setIdleWarning(true);
      }, IDLE_TIMEOUT_MS);
    }

    const events = ['mousemove', 'keydown', 'mousedown', 'touchstart', 'scroll'];
    events.forEach(e => window.addEventListener(e, resetIdle, { passive: true }));
    resetIdle();
    
    return () => {
      events.forEach(e => window.removeEventListener(e, resetIdle));
      if (idleRef.current) clearTimeout(idleRef.current);
    };
  }, []);

  const handleModeTrigger = (selectedMode: Mode) => {
    setMode(selectedMode);
    localStorage.setItem('agentalpha.mode', selectedMode);
    
    const config = MODE_CONFIG[selectedMode];
    playTone(config.freq, 0.18);
    
    window.dispatchEvent(new CustomEvent('AgentAlpha:trigger', { detail: { mode: selectedMode } }));
  };

  const activeConfig = MODE_CONFIG[mode];

  return (
    <div className="relative min-h-screen bg-[#020202] text-foreground flex flex-col items-center justify-center p-4 md:p-8 overflow-hidden font-sans">
      {/* Dynamic Background Effects */}
      <div className={`absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] transition-colors duration-1000 ${activeConfig.bgGlow} via-transparent to-transparent opacity-60 z-0`} />
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.15] z-0" />
      <div className="absolute inset-0 scanlines opacity-30 z-0" />

      {/* Main Container */}
      <div className="relative z-10 w-full max-w-6xl space-y-16">
        
        {/* Header HUD */}
        <div className="flex flex-col items-center space-y-6">
          <div className="flex items-center space-x-3 px-6 py-2 rounded-full border border-white/10 bg-white/5 backdrop-blur-md">
            <Activity className={`w-5 h-5 ${activeConfig.color} animate-pulse`} />
            <span className="font-mono text-sm tracking-[0.2em] text-white/70">
              AGENT_ALPHA // SYS_CONTROL
            </span>
          </div>
          
          <h1 className="text-6xl md:text-8xl lg:text-[10rem] font-bold uppercase tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/30 leading-none">
            {mode}
          </h1>
          
          <div className="flex items-center space-x-4">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${activeConfig.bg}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${activeConfig.bg}`}></span>
            </span>
            <span className={`font-mono text-lg tracking-[0.3em] uppercase ${activeConfig.color}`}>
              {activeConfig.desc}
            </span>
          </div>
        </div>

        {/* Control Buttons Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto w-full">
          {MODES.map((m) => {
            const config = MODE_CONFIG[m];
            const isActive = mode === m;
            
            return (
              <button
                key={m}
                onClick={() => handleModeTrigger(m)}
                className={`
                  group relative flex flex-col items-center justify-center p-12 overflow-hidden border backdrop-blur-md transition-all duration-500 outline-none
                  ${isActive 
                    ? `${config.border} bg-white/5 ${config.glow}` 
                    : 'border-white/10 bg-black/40 hover:bg-white/5 hover:border-white/30'}
                `}
              >
                {/* Background active glow */}
                <div className={`absolute inset-0 opacity-0 transition-opacity duration-500 ${isActive ? 'opacity-10' : 'group-hover:opacity-5'} ${config.bg}`} />
                
                {/* Corner Accents */}
                <div className={`absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 transition-colors duration-300 ${isActive ? config.border : 'border-transparent group-hover:border-white/20'}`} />
                <div className={`absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 transition-colors duration-300 ${isActive ? config.border : 'border-transparent group-hover:border-white/20'}`} />
                <div className={`absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 transition-colors duration-300 ${isActive ? config.border : 'border-transparent group-hover:border-white/20'}`} />
                <div className={`absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 transition-colors duration-300 ${isActive ? config.border : 'border-transparent group-hover:border-white/20'}`} />

                <config.icon className={`w-12 h-12 mb-6 transition-all duration-500 ${isActive ? `${config.color} scale-110 drop-shadow-[0_0_15px_currentColor]` : 'text-white/40 group-hover:text-white/80'}`} />
                
                <h3 className={`text-3xl font-bold tracking-[0.15em] mb-2 transition-colors duration-500 ${isActive ? config.color : 'text-white/60 group-hover:text-white'}`}>
                  {m}
                </h3>
                
                {isActive && (
                  <motion.div 
                    layoutId="activeIndicator"
                    className={`absolute bottom-0 left-0 right-0 h-1 ${config.bg}`}
                    initial={false}
                    transition={{ type: "spring", stiffness: 300, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        <TerminalLog />
      </div>

      {/* Idle Warning Overlay */}
      <AnimatePresence>
        {idleWarning && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-xl"
          >
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-amber-900/40 via-transparent to-transparent animate-pulse" />
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="relative z-10 text-center space-y-8 p-16 border border-amber-500/30 rounded-none bg-black/50 shadow-[0_0_100px_rgba(245,158,11,0.15)]"
            >
              <AlertTriangle className="w-32 h-32 text-amber-500 mx-auto drop-shadow-[0_0_30px_rgba(245,158,11,0.5)]" />
              <div>
                <h2 className="text-6xl md:text-8xl font-bold text-amber-500 tracking-[0.15em] mb-4">IDLE PING</h2>
                <p className="text-amber-400/80 font-mono text-xl tracking-[0.3em] uppercase">Interaction Required To Resume</p>
              </div>
              <p className="text-white/40 font-mono text-sm mt-12 animate-pulse">Press any key or move cursor to dismiss</p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 text-center w-full z-10 pointer-events-none">
        <p className="font-mono text-xs text-white/30 tracking-widest">
          LISTENING FOR <span className="text-white/60">`AgentAlpha:trigger`</span> EVENTS
        </p>
      </div>
    </div>
  );
}
