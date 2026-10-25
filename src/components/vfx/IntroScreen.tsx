import React, { useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/SoundEffects';
import { FastForward, Terminal, Cpu } from 'lucide-react';
import { useImages } from '../../context/ImageContext';

interface IntroScreenProps {
  onComplete: () => void;
  lowEffects?: boolean;
}

interface MissileWord {
  id: string;
  text: string;
  group: 'badge' | 'title' | 'subtitle' | 'tagline';
  initialX: number; // Offscreen launch X coordinate
  initialY: number; // Offscreen launch Y coordinate
  initialRotate: number;
  delay: number; // Launch staggered delay in seconds
  duration: number; // Flight duration
  colorClass: string;
}

/**
 * IntroScreen (Exploded View Intro)
 * - Screen starts in pure deep darkness
 * - Individual words launch like missiles from offscreen with smoke trails and kinetic velocity.
 * - Words assemble and snap tightly into place like an exploded view assembly.
 * - Synced with real loading, capped at ~3.5 seconds.
 * - Skip button provided, runs once per session via sessionStorage.
 * - Audio starts on first user touch.
 * - Low-effects friendly fallback.
 * - Can be toggled on/off in Admin settings.
 */
export const IntroScreen: React.FC<IntroScreenProps> = ({ onComplete, lowEffects = false }) => {
  const { siteSettings } = useImages();
  const introEnabled = siteSettings.explodedIntro?.enabled !== false;

  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);
  const [isAssetsLoaded, setIsAssetsLoaded] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // If disabled in Admin, skip immediately
  useEffect(() => {
    if (!introEnabled) {
      setIsVisible(false);
      onComplete();
      return;
    }

    const hasSeen =
      sessionStorage.getItem('mohit_intro_seen') ||
      sessionStorage.getItem('cybermohit_intro_seen');
    if (hasSeen) {
      setIsVisible(false);
      onComplete();
      return;
    }

    // Check document loading state
    if (document.readyState === 'complete') {
      setIsAssetsLoaded(true);
    } else {
      const handleLoad = () => setIsAssetsLoaded(true);
      window.addEventListener('load', handleLoad);
      return () => window.removeEventListener('load', handleLoad);
    }
  }, [introEnabled, onComplete]);

  // Overall sequence and progress timer (max 3.2 - 3.6s total)
  useEffect(() => {
    const hasSeen =
      sessionStorage.getItem('mohit_intro_seen') ||
      sessionStorage.getItem('cybermohit_intro_seen');
    if (!introEnabled || hasSeen) return;

    sound.playWarp();
    const interval = setInterval(() => {
      setProgress((prev) => {
        const step = isAssetsLoaded ? 4 : 2;
        const next = prev + step;
        if (next >= 100) {
          clearInterval(interval);
          handleFinish();
          return 100;
        }
        return next;
      });
    }, 45);

    return () => clearInterval(interval);
  }, [introEnabled, isAssetsLoaded]);

  const handleFinish = () => {
    sessionStorage.setItem('mohit_intro_seen', 'true');
    sessionStorage.setItem('cybermohit_intro_seen', 'true');
    setIsVisible(false);
    setTimeout(() => {
      onComplete();
    }, 350);
  };

  // Missile Word Part Definitions for Exploded View Assembly
  const missileWords: MissileWord[] = useMemo(() => [
    {
      id: 'w-crest',
      text: 'MOHIT YADAV',
      group: 'title',
      initialX: 0,
      initialY: -750,
      initialRotate: 12,
      delay: 0.2,
      duration: 0.85,
      colorClass: 'text-3xl sm:text-5xl md:text-6xl font-black font-cyber text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-sky-200 to-fuchsia-400 drop-shadow-[0_0_25px_rgba(0,240,255,0.7)]',
    },
    {
      id: 'w-future',
      text: 'FUTURE',
      group: 'subtitle',
      initialX: -650,
      initialY: -450,
      initialRotate: -35,
      delay: 0.55,
      duration: 0.75,
      colorClass: 'text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest text-cyan-300 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    },
    {
      id: 'w-ai',
      text: 'AI',
      group: 'subtitle',
      initialX: 550,
      initialY: -550,
      initialRotate: 40,
      delay: 0.7,
      duration: 0.7,
      colorClass: 'text-xs sm:text-sm md:text-base font-black font-cyber tracking-widest text-fuchsia-400 drop-shadow-[0_0_14px_rgba(217,70,239,0.7)]',
    },
    {
      id: 'w-engineer',
      text: 'ENGINEER',
      group: 'subtitle',
      initialX: -700,
      initialY: 300,
      initialRotate: -25,
      delay: 0.85,
      duration: 0.75,
      colorClass: 'text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest text-cyan-200 drop-shadow-[0_0_12px_rgba(6,182,212,0.6)]',
    },
    {
      id: 'w-dot',
      text: '•',
      group: 'subtitle',
      initialX: 0,
      initialY: -800,
      initialRotate: 90,
      delay: 0.95,
      duration: 0.6,
      colorClass: 'text-xs sm:text-sm md:text-base font-mono text-slate-500',
    },
    {
      id: 'w-python',
      text: 'PYTHON',
      group: 'subtitle',
      initialX: 700,
      initialY: 400,
      initialRotate: 30,
      delay: 1.05,
      duration: 0.75,
      colorClass: 'text-xs sm:text-sm md:text-base font-black font-cyber tracking-widest text-amber-300 drop-shadow-[0_0_14px_rgba(251,191,36,0.7)]',
    },
    {
      id: 'w-developer',
      text: 'DEVELOPER',
      group: 'subtitle',
      initialX: -500,
      initialY: -700,
      initialRotate: -45,
      delay: 1.2,
      duration: 0.75,
      colorClass: 'text-xs sm:text-sm md:text-base font-bold font-mono tracking-widest text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.6)]',
    },
    {
      id: 'w-tag1',
      text: 'SYSTEM CORE LOADED',
      group: 'tagline',
      initialX: 0,
      initialY: 600,
      initialRotate: 0,
      delay: 1.45,
      duration: 0.7,
      colorClass: 'text-[10px] sm:text-xs font-mono tracking-[0.25em] text-cyan-400/90 uppercase',
    },
  ], []);

  // Smoke trail particles behind flying missiles
  useEffect(() => {
    if (!isVisible || lowEffects) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    interface SmokePuff {
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      color: string;
      life: number;
      maxLife: number;
    }

    const puffs: SmokePuff[] = [];
    const colors = ['rgba(0, 240, 255,', 'rgba(255, 0, 170,', 'rgba(220, 38, 38,', 'rgba(168, 85, 247,'];

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Random supersonic smoke trails streaking in from outer edges towards center
      if (Math.random() < 0.65) {
        const fromTop = Math.random() < 0.5;
        const startX = Math.random() * width;
        const startY = fromTop ? -20 : height + 20;
        const targetX = width / 2 + (Math.random() - 0.5) * 300;
        const targetY = height / 2 + (Math.random() - 0.5) * 150;
        const angle = Math.atan2(targetY - startY, targetX - startX);
        const speed = Math.random() * 8 + 8;

        puffs.push({
          x: startX,
          y: startY,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 8 + 4,
          alpha: 0.8,
          color: colors[Math.floor(Math.random() * colors.length)],
          life: 0,
          maxLife: Math.random() * 25 + 20,
        });
      }

      ctx.globalCompositeOperation = 'lighter';
      for (let i = puffs.length - 1; i >= 0; i--) {
        const p = puffs[i];
        p.life++;
        p.x += p.vx;
        p.y += p.vy;
        p.radius += 0.8;

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          puffs.splice(i, 1);
          continue;
        }

        const a = (1 - progress) * p.alpha;
        const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
        grad.addColorStop(0, `${p.color} ${a})`);
        grad.addColorStop(0.5, `${p.color} ${a * 0.4})`);
        grad.addColorStop(1, `${p.color} 0)`);
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.globalCompositeOperation = 'source-over';

      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animId);
    };
  }, [isVisible, lowEffects]);

  if (!isVisible || !introEnabled) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 1 }}
        exit={{ opacity: 0, filter: 'blur(10px)' }}
        transition={{ duration: 0.45, ease: 'easeInOut' }}
        onClick={() => {
          sound.playClick();
          handleFinish();
        }}
        onTouchStart={() => {
          sound.playClick();
        }}
        className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-slate-950 select-none overflow-hidden cursor-pointer"
        aria-label="Portfolio Introduction Screen"
      >
        {/* Background Smoke Canvas */}
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none"
        />

        {/* Ambient Grid Lines for Exploded View Blueprint feel */}
        <div className="absolute inset-0 bg-[radial-gradient(#06b6d4_1px,transparent_1px)] [background-size:32px_32px] opacity-15 pointer-events-none" />

        {/* Top Diagnostic Hud */}
        <div className="absolute top-6 left-6 right-6 flex items-center justify-between text-[10px] font-mono text-cyan-400/70 border-b border-cyan-500/20 pb-2 z-20">
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span className="tracking-widest">ASSEMBLING SYSTEM COMPONENTS [EXPLODED_VIEW]</span>
          </div>
          <div className="flex items-center gap-2">
            <Terminal className="w-3.5 h-3.5 text-fuchsia-400" />
            <span>PROGRESS: {progress}%</span>
          </div>
        </div>

        {/* Exploded View Assembly Container */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4 max-w-3xl space-y-5">
          {/* Central Monogram Crest - Drops in with shockwave */}
          <motion.div
            initial={lowEffects ? { opacity: 0 } : { y: -500, scale: 0.2, rotate: -20, opacity: 0 }}
            animate={{ y: 0, scale: 1, rotate: 0, opacity: 1 }}
            transition={{
              type: 'spring',
              stiffness: 140,
              damping: 15,
              delay: 0.1,
            }}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-slate-900/90 border border-cyan-500/60 shadow-[0_0_35px_rgba(0,240,255,0.45)] flex items-center justify-center relative backdrop-blur-md"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 via-transparent to-fuchsia-500/20 rounded-2xl" />
            <span className="font-cyber font-black text-3xl sm:text-4xl tracking-tighter bg-gradient-to-r from-cyan-200 via-sky-100 to-fuchsia-200 bg-clip-text text-transparent drop-shadow-[0_0_12px_rgba(0,240,255,0.8)]">
              MY
            </span>
          </motion.div>

          {/* Title Part: "MOHIT YADAV" launches like supersonic missile */}
          <div className="relative">
            <motion.h1
              initial={
                lowEffects
                  ? { opacity: 0, y: 15 }
                  : {
                      x: missileWords[0].initialX,
                      y: missileWords[0].initialY,
                      rotate: missileWords[0].initialRotate,
                      opacity: 0,
                      scale: 1.6,
                    }
              }
              animate={{
                x: 0,
                y: 0,
                rotate: 0,
                opacity: 1,
                scale: 1,
              }}
              transition={{
                duration: missileWords[0].duration,
                delay: missileWords[0].delay,
                ease: [0.16, 1, 0.3, 1],
              }}
              className={missileWords[0].colorClass}
            >
              {missileWords[0].text}
            </motion.h1>
          </div>

          {/* Subtitle Words: Fly in from scattered corners and lock together into a single line */}
          <div className="flex flex-wrap items-center justify-center gap-x-2 gap-y-1">
            {missileWords
              .filter((w) => w.group === 'subtitle')
              .map((word) => (
                <motion.span
                  key={word.id}
                  initial={
                    lowEffects
                      ? { opacity: 0 }
                      : {
                          x: word.initialX,
                          y: word.initialY,
                          rotate: word.initialRotate,
                          opacity: 0,
                          scale: 1.4,
                        }
                  }
                  animate={{
                    x: 0,
                    y: 0,
                    rotate: 0,
                    opacity: 1,
                    scale: 1,
                  }}
                  transition={{
                    duration: word.duration,
                    delay: word.delay,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className={word.colorClass}
                >
                  {word.text}
                </motion.span>
              ))}
          </div>

          {/* Tagline Part: Slams into place at the bottom */}
          {missileWords
            .filter((w) => w.group === 'tagline')
            .map((word) => (
              <motion.div
                key={word.id}
                initial={
                  lowEffects
                    ? { opacity: 0 }
                    : {
                        y: word.initialY,
                        opacity: 0,
                        scale: 0.8,
                      }
                }
                animate={{
                  y: 0,
                  opacity: 1,
                  scale: 1,
                }}
                transition={{
                  duration: word.duration,
                  delay: word.delay,
                  ease: [0.16, 1, 0.3, 1],
                }}
                className={word.colorClass}
              >
                {word.text}
              </motion.div>
            ))}

          {/* Real Asset Loading & Sync Progress Bar */}
          <div className="w-48 sm:w-64 h-1.5 rounded-full bg-slate-900 border border-cyan-500/30 overflow-hidden relative mt-4 shadow-[0_0_15px_rgba(0,240,255,0.3)]">
            <motion.div
              className="h-full bg-gradient-to-r from-cyan-400 via-sky-300 to-fuchsia-400"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Fast Skip Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            sound.playClick();
            handleFinish();
          }}
          className="absolute bottom-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-slate-900/90 hover:bg-slate-800 border border-cyan-500/50 text-xs font-mono text-cyan-200 hover:text-white flex items-center gap-1.5 transition cursor-pointer backdrop-blur-md shadow-[0_0_15px_rgba(0,240,255,0.3)]"
          title="Skip Intro"
        >
          <span>Skip</span>
          <FastForward className="w-3.5 h-3.5 text-cyan-400" />
        </button>
      </motion.div>
    </AnimatePresence>
  );
};
