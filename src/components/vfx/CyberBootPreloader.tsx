import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/SoundEffects';
import { Cpu, Sparkles, Shield, Zap } from 'lucide-react';

interface CyberBootPreloaderProps {
  onComplete: () => void;
  primaryPhotoUrl?: string | null;
  orbitPhotoUrls?: string[];
}

export const CyberBootPreloader: React.FC<CyberBootPreloaderProps> = ({
  onComplete,
  primaryPhotoUrl,
  orbitPhotoUrls = [],
}) => {
  const [progress, setProgress] = useState(0);
  const [statusText, setStatusText] = useState('INITIALIZING QUANTUM CORE...');
  const [isDone, setIsDone] = useState(false);
  const hasFinishedRef = useRef(false);

  // Preload photos in background during boot
  useEffect(() => {
    const urlsToPreload = [primaryPhotoUrl, ...orbitPhotoUrls].filter(Boolean) as string[];
    urlsToPreload.forEach((url) => {
      try {
        const img = new Image();
        if (url.startsWith('http')) img.crossOrigin = 'anonymous';
        img.src = url;
      } catch {}
    });
  }, [primaryPhotoUrl, orbitPhotoUrls]);

  useEffect(() => {
    const statusMessages = [
      'CONNECTING TO MULTIVERSE ARCHITECTURE...',
      'CALIBRATING 3D NEURAL TEXTURES...',
      'PRE-CACHING HIGH-RES VISUAL ASSETS...',
      'SYNCHRONIZING ORBIT DYNAMICS...',
      'SYSTEM READY // INTERFACE ENGAGED',
    ];

    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;
        const msgIdx = Math.min(
          Math.floor((next / 100) * statusMessages.length),
          statusMessages.length - 1
        );
        setStatusText(statusMessages[msgIdx]);

        if (next >= 100) {
          clearInterval(timer);
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true;
            setIsDone(true);
            sound.playWarp();
            setTimeout(() => {
              onComplete();
            }, 450);
          }
          return 100;
        }
        return next;
      });
    }, 55);

    return () => clearInterval(timer);
  }, [onComplete]);

  const handleSkip = () => {
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      setIsDone(true);
      sound.playClick();
      onComplete();
    }
  };

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          onTouchStartCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onTouchMoveCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onTouchEndCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onPointerDownCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onPointerUpCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onScrollCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          onClickCapture={() => {
            (window as any).__startBackgroundMusic?.();
          }}
          className="fixed inset-0 z-[9999] bg-[#030712] flex flex-col items-center justify-center p-6 select-none overflow-hidden"
        >
          {/* Ambient Cyber Grid & Glow */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.15)_0%,transparent_70%)] pointer-events-none" />
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#08132915_1px,transparent_1px),linear-gradient(to_bottom,#08132915_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none" />

          {/* Central Reactor Core HUD */}
          <div className="relative flex flex-col items-center max-w-md w-full space-y-8 z-10">
            {/* Spinning Holographic Rings */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              {/* Outer Counter-Rotating Dashed Ring */}
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-500/40"
              />
              {/* Inner Glowing Rotating Hexagon / Ring */}
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 3.5, repeat: Infinity, ease: 'linear' }}
                className="absolute inset-3 rounded-full border-2 border-amber-400/60 shadow-[0_0_25px_rgba(245,158,11,0.35)]"
              />
              {/* Central Glowing Icon */}
              <motion.div
                animate={{ scale: [0.95, 1.08, 0.95] }}
                transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
                className="w-16 h-16 rounded-2xl bg-gradient-to-br from-cyan-500/20 via-slate-900 to-amber-500/20 border border-cyan-400/50 flex items-center justify-center shadow-[0_0_30px_rgba(6,182,212,0.4)] backdrop-blur-md"
              >
                <Cpu className="w-8 h-8 text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.8)]" />
              </motion.div>
            </div>

            {/* Title & Branding */}
            <div className="text-center space-y-1.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-[10px] font-mono text-cyan-300 tracking-widest uppercase">
                <Sparkles className="w-3 h-3 text-amber-400 animate-spin" />
                <span>CYBERNETIC ARCHITECTURE v3.0</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-cyber font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-white to-amber-300 drop-shadow-[0_0_20px_rgba(6,182,212,0.6)]">
                MOHIT YADAV
              </h1>
              <p className="text-xs font-mono text-slate-400 tracking-wider">
                CLASS 12 SCIENCE • FUTURE AI ENGINEER
              </p>
            </div>

            {/* Futuristic Progress HUD */}
            <div className="w-full space-y-2.5">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-cyan-400 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                  {statusText}
                </span>
                <span className="text-amber-300 font-bold tracking-wider">
                  {Math.min(progress, 100)}%
                </span>
              </div>

              {/* Progress Track */}
              <div className="relative h-2.5 w-full bg-slate-900/90 rounded-full border border-cyan-500/30 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-cyan-500 via-blue-500 to-amber-400 rounded-full shadow-[0_0_16px_rgba(6,182,212,0.8)]"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                  transition={{ ease: 'easeOut', duration: 0.1 }}
                />
              </div>
            </div>

            {/* Fast Skip Option */}
            <button
              onClick={handleSkip}
              className="text-[11px] font-mono text-slate-500 hover:text-cyan-300 transition-colors cursor-pointer tracking-wider flex items-center gap-1.5 pt-2"
            >
              <span>[ ESC / CLICK TO ENTER DIRECTLY ]</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
