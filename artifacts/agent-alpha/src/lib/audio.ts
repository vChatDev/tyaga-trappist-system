/**
 * Utility to play synthesized audio tones using the Web Audio API.
 * Ensures cross-browser compatibility and handles silent failures if audio context is blocked.
 */
export function playTone(freq: number = 440, duration: number = 0.25) {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    
    const ctx = new AudioContextClass();
    const oscillator = ctx.createOscillator();
    const gainNode = ctx.createGain();
    
    oscillator.type = 'sine';
    oscillator.frequency.value = freq;
    
    oscillator.connect(gainNode);
    gainNode.connect(ctx.destination);
    
    // Envelope to avoid clicking noises at start/end
    gainNode.gain.setValueAtTime(0.001, ctx.currentTime);
    oscillator.start(ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.25, ctx.currentTime + 0.01);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
    
    setTimeout(() => {
      oscillator.stop();
      try {
        ctx.close();
      } catch (e) {
        // cleanup fail safe
      }
    }, duration * 1000 + 150);
  } catch (e) {
    console.warn("Audio playback failed or blocked by browser policy.", e);
  }
}
