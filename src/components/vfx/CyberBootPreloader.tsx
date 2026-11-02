import React, { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { sound } from '../audio/SoundEffects';
import { Cpu, Sparkles } from 'lucide-react';

interface CyberBootPreloaderProps {
  onComplete: () => void;
  primaryPhotoUrl?: string | null;
  orbitPhotoUrls?: string[];
}

// Same five status lines as before.
const STATUS_MESSAGES = [
  'CONNECTING TO MULTIVERSE ARCHITECTURE...',
  'CALIBRATING 3D NEURAL TEXTURES...',
  'PRE-CACHING HIGH-RES VISUAL ASSETS...',
  'SYNCHRONIZING ORBIT DYNAMICS...',
  'SYSTEM READY // INTERFACE ENGAGED',
];

const INITIAL_STATUS = 'INITIALIZING QUANTUM CORE...';

// Progress dial geometry (SVG viewBox is 220 x 220).
const DIAL_RADIUS = 96;
const DIAL_CIRCUMFERENCE = 2 * Math.PI * DIAL_RADIUS;

interface Star {
  left: number;
  top: number;
  size: number;
  duration: number;
  delay: number;
}

/**
 * "Royal Aurora" look.
 * All class names start with "rab-" so nothing leaks into the rest of the site.
 * The Bodoni Moda font is requested here; if you already load fonts in index.html
 * you can delete the @import line.
 */
const AURORA_CSS = `
@import url('https://fonts.googleapis.com/css2?family=Bodoni+Moda:opsz,wght@6..96,700&family=JetBrains+Mono:wght@400;700&display=swap');

.rab-root {
  --rab-bg: #07050f;
  --rab-c1: #22d3ee;
  --rab-c2: #8b5cf6;
  --rab-c3: #ec4899;
  --rab-c4: #fbbf24;
  --rab-ink: #d8d2ee;
  --rab-glass: rgba(12, 9, 26, 0.58);
  --rab-display: 'Bodoni Moda', 'Playfair Display', Georgia, serif;
  --rab-mono: 'JetBrains Mono', ui-monospace, Menlo, monospace;
}

.rab-aurora { position: absolute; inset: 0; pointer-events: none; overflow: hidden; }
.rab-blob {
  position: absolute; width: 62vmin; height: 62vmin; min-width: 320px; min-height: 320px;
  border-radius: 9999px; filter: blur(80px); opacity: 0.6; will-change: transform;
}
.rab-blob-a { background: #7c3aed; top: -18%; left: -10%; animation: rabDriftA 15s ease-in-out infinite alternate; }
.rab-blob-b { background: #ec4899; bottom: -22%; right: -12%; animation: rabDriftB 18s ease-in-out infinite alternate; }
.rab-blob-c { background: #22d3ee; top: 30%; left: 55%; opacity: 0.38; animation: rabDriftC 21s ease-in-out infinite alternate; }
@keyframes rabDriftA { to { transform: translate3d(14%, 18%, 0) scale(1.15); } }
@keyframes rabDriftB { to { transform: translate3d(-16%, -12%, 0) scale(1.1); } }
@keyframes rabDriftC { to { transform: translate3d(-30%, 22%, 0) scale(0.9); } }

.rab-stars { position: absolute; inset: 0; pointer-events: none; }
.rab-star {
  position: absolute; background: #fff; opacity: 0;
  clip-path: polygon(50% 0, 62% 38%, 100% 50%, 62% 62%, 50% 100%, 38% 62%, 0 50%, 38% 38%);
  filter: drop-shadow(0 0 6px #fff);
  animation: rabTwinkle var(--rab-d) ease-in-out infinite; animation-delay: var(--rab-s);
}
@keyframes rabTwinkle {
  0%, 100% { opacity: 0; transform: scale(0.4) rotate(0deg); }
  50% { opacity: 0.95; transform: scale(1) rotate(45deg); }
}

.rab-card {
  position: relative; z-index: 10; width: 100%; max-width: 440px; padding: 30px 26px 24px;
  border-radius: 28px; display: grid; gap: 22px; justify-items: center; text-align: center;
  background: var(--rab-glass);
  -webkit-backdrop-filter: blur(22px) saturate(1.4); backdrop-filter: blur(22px) saturate(1.4);
  box-shadow: 0 30px 80px rgba(0, 0, 0, 0.55), inset 0 1px 0 rgba(255, 255, 255, 0.22);
}
.rab-card::before {
  content: ''; position: absolute; inset: 0; border-radius: inherit; padding: 1.5px; pointer-events: none;
  background: linear-gradient(140deg, var(--rab-c1), var(--rab-c2) 35%, var(--rab-c3) 65%, var(--rab-c4));
  -webkit-mask: linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask: linear-gradient(#000 0 0) content-box exclude, linear-gradient(#000 0 0);
}

.rab-badge {
  display: inline-flex; align-items: center; gap: 8px; padding: 6px 14px; border-radius: 9999px;
  background: rgba(255, 255, 255, 0.07); border: 1px solid rgba(255, 255, 255, 0.22);
  font: 400 10px/1.4 var(--rab-mono); letter-spacing: 0.22em; text-transform: uppercase; color: #fff;
}
.rab-badge svg { width: 13px; height: 13px; color: var(--rab-c4); animation: rabSpin 1s linear infinite; }

.rab-dial { position: relative; width: min(224px, 62vw); aspect-ratio: 1; display: grid; place-items: center; }
.rab-ring { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.rab-track { stroke: rgba(255, 255, 255, 0.1); }
.rab-prog { transition: stroke-dashoffset 0.1s ease-out; filter: drop-shadow(0 0 8px var(--rab-c3)); }
.rab-head {
  transform-box: view-box; transform-origin: 110px 110px;
  transition: transform 0.1s ease-out; filter: drop-shadow(0 0 8px #fff);
}
.rab-orbit {
  position: absolute; inset: -14px; border-radius: 9999px; border: 1px dashed rgba(255, 255, 255, 0.22);
  animation: rabSpinReverse 6s linear infinite;
}
.rab-orbit::after {
  content: ''; position: absolute; top: -4px; left: 50%; width: 8px; height: 8px; margin-left: -4px;
  border-radius: 9999px; background: var(--rab-c1); box-shadow: 0 0 12px 3px var(--rab-c1);
}
.rab-orbit-inner { position: absolute; inset: 8px; border-radius: 9999px; animation: rabSpin 3.5s linear infinite; }
.rab-orbit-inner::after {
  content: ''; position: absolute; bottom: -3px; left: 50%; width: 6px; height: 6px; margin-left: -3px;
  border-radius: 9999px; background: var(--rab-c4); box-shadow: 0 0 10px 2px var(--rab-c4);
}
.rab-center { position: relative; display: grid; justify-items: center; gap: 4px; animation: rabPulse 1.6s ease-in-out infinite; }
.rab-center svg { width: 28px; height: 28px; color: #fff; filter: drop-shadow(0 0 10px var(--rab-c2)); }
.rab-pct {
  font: 700 clamp(2.3rem, 9vw, 3rem)/1 var(--rab-display); color: #fff;
  font-variant-numeric: lining-nums tabular-nums; text-shadow: 0 0 24px var(--rab-c2);
}

.rab-name {
  margin: 0; font: 700 clamp(1.8rem, 7.2vw, 2.6rem)/1.1 var(--rab-display);
  letter-spacing: 0.13em; padding-left: 0.13em;
  background-image: linear-gradient(100deg, #fff 0%, var(--rab-c1) 22%, #fff 40%, var(--rab-c4) 60%, var(--rab-c3) 80%, #fff 100%);
  background-size: 200% 100%; -webkit-background-clip: text; background-clip: text; color: transparent;
  animation: rabShimmer 5s linear infinite; filter: drop-shadow(0 4px 22px rgba(0, 0, 0, 0.45));
}
.rab-sub { margin: 8px 0 0; font: 400 11px/1.5 var(--rab-mono); letter-spacing: 0.18em; color: var(--rab-ink); overflow-wrap: anywhere; }

.rab-statusrow { width: 100%; display: grid; gap: 12px; }
.rab-status {
  display: flex; align-items: center; justify-content: center; gap: 8px;
  font: 400 12px/1.4 var(--rab-mono); color: #fff; min-height: 2.8em;
}
.rab-status-text { overflow-wrap: anywhere; }
.rab-ping { position: relative; width: 7px; height: 7px; flex: none; }
.rab-ping::before, .rab-ping::after { content: ''; position: absolute; inset: 0; border-radius: 9999px; background: var(--rab-c1); }
.rab-ping::before { animation: rabPing 1s cubic-bezier(0, 0, 0.2, 1) infinite; }
.rab-steps { display: grid; grid-template-columns: repeat(5, 1fr); gap: 6px; }
.rab-step { height: 4px; border-radius: 4px; background: rgba(255, 255, 255, 0.14); transition: background 0.25s, box-shadow 0.25s; }
.rab-step.is-on { background: linear-gradient(90deg, var(--rab-c1), var(--rab-c3)); box-shadow: 0 0 10px var(--rab-c2); }
.rab-step.is-now { background: linear-gradient(90deg, var(--rab-c4), #fff); box-shadow: 0 0 12px var(--rab-c4); }

.rab-skip {
  cursor: pointer; border: 1px solid rgba(255, 255, 255, 0.24); background: rgba(255, 255, 255, 0.06);
  color: var(--rab-ink); padding: 9px 16px; border-radius: 9999px;
  font: 400 11px/1.4 var(--rab-mono); letter-spacing: 0.1em;
  transition: background 0.2s, color 0.2s, border-color 0.2s;
}
.rab-skip:hover { background: rgba(255, 255, 255, 0.14); color: #fff; border-color: var(--rab-c1); }
.rab-skip:focus-visible { outline: 2px solid var(--rab-c4); outline-offset: 3px; }

@keyframes rabSpin { to { transform: rotate(360deg); } }
@keyframes rabSpinReverse { to { transform: rotate(-360deg); } }
@keyframes rabPulse { 0%, 100% { transform: scale(0.97); } 50% { transform: scale(1.05); } }
@keyframes rabShimmer { to { background-position: -200% 0; } }
@keyframes rabPing { 75%, 100% { transform: scale(2.2); opacity: 0; } }

@media (prefers-reduced-motion: reduce) {
  .rab-blob, .rab-star, .rab-orbit, .rab-orbit-inner, .rab-center, .rab-name,
  .rab-badge svg, .rab-ping::before { animation: none !important; }
}
`;

export const CyberBootPreloader: React.FC<CyberBootPreloaderProps> = ({
  onComplete,
  primaryPhotoUrl,
  orbitPhotoUrls = [],
}) => {
  const [progress, setProgress] = useState(0);
  const [isDone, setIsDone] = useState(false);
  const [stars, setStars] = useState<Star[]>([]);
  const hasFinishedRef = useRef(false);

  // Keep the latest onComplete without restarting the progress timer
  // when the parent passes a new function on every render.
  const onCompleteRef = useRef(onComplete);
  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  // Status line and active step come straight from the progress value.
  const clampedProgress = Math.min(progress, 100);
  const stepIndex =
    progress <= 0
      ? -1
      : Math.min(
          Math.floor((clampedProgress / 100) * STATUS_MESSAGES.length),
          STATUS_MESSAGES.length - 1
        );
  const statusText = stepIndex < 0 ? INITIAL_STATUS : STATUS_MESSAGES[stepIndex];

  // Twinkling stars are created in the browser only, so server rendering never mismatches.
  useEffect(() => {
    setStars(
      Array.from({ length: 16 }, () => ({
        left: Math.random() * 96,
        top: Math.random() * 94,
        size: 6 + Math.random() * 9,
        duration: 2.4 + Math.random() * 3,
        delay: -Math.random() * 5,
      }))
    );
  }, []);

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
    const timer = setInterval(() => {
      setProgress((prev) => {
        const next = prev + Math.floor(Math.random() * 8) + 4;

        if (next >= 100) {
          clearInterval(timer);
          if (!hasFinishedRef.current) {
            hasFinishedRef.current = true;
            setIsDone(true);
            sound.playWarp();
            setTimeout(() => {
              onCompleteRef.current();
            }, 450);
          }
          return 100;
        }
        return next;
      });
    }, 55);

    return () => clearInterval(timer);
  }, []);

  const handleSkip = useCallback(() => {
    if (!hasFinishedRef.current) {
      hasFinishedRef.current = true;
      setIsDone(true);
      sound.playClick();
      onCompleteRef.current();
    }
  }, []);

  // The button says "ESC / CLICK", so Escape now works too.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') handleSkip();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleSkip]);

  const startMusic = () => {
    (window as any).__startBackgroundMusic?.();
  };

  const strokeOffset = DIAL_CIRCUMFERENCE * (1 - clampedProgress / 100);
  const allDone = clampedProgress >= 100;

  return (
    <AnimatePresence>
      {!isDone && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          onTouchStartCapture={startMusic}
          onTouchMoveCapture={startMusic}
          onTouchEndCapture={startMusic}
          onPointerDownCapture={startMusic}
          onPointerUpCapture={startMusic}
          onScrollCapture={startMusic}
          onClickCapture={startMusic}
          className="rab-root fixed inset-0 z-[9999] flex select-none items-center justify-center overflow-hidden bg-[#07050f] p-5"
        >
          <style>{AURORA_CSS}</style>

          {/* Moving aurora light and twinkling stars */}
          <div className="rab-aurora" aria-hidden="true">
            <div className="rab-blob rab-blob-a" />
            <div className="rab-blob rab-blob-b" />
            <div className="rab-blob rab-blob-c" />
          </div>

          <div className="rab-stars" aria-hidden="true">
            {stars.map((star, index) => (
              <i
                key={index}
                className="rab-star"
                style={
                  {
                    left: `${star.left}%`,
                    top: `${star.top}%`,
                    width: star.size,
                    height: star.size,
                    '--rab-d': `${star.duration}s`,
                    '--rab-s': `${star.delay}s`,
                  } as React.CSSProperties
                }
              />
            ))}
          </div>

          {/* Glass card */}
          <div className="rab-card">
            <div className="rab-badge">
              <Sparkles aria-hidden="true" />
              <span>CYBERNETIC ARCHITECTURE v3.0</span>
            </div>

            {/* Progress dial */}
            <div className="rab-dial">
              <div className="rab-orbit" aria-hidden="true" />
              <div className="rab-orbit-inner" aria-hidden="true" />

              <svg className="rab-ring" viewBox="0 0 220 220" aria-hidden="true">
                <defs>
                  <linearGradient id="rab-grad" x1="0" y1="1" x2="1" y2="0">
                    <stop offset="0" stopColor="#22d3ee" />
                    <stop offset="0.38" stopColor="#8b5cf6" />
                    <stop offset="0.7" stopColor="#ec4899" />
                    <stop offset="1" stopColor="#fbbf24" />
                  </linearGradient>
                </defs>
                <circle
                  className="rab-track"
                  cx="110"
                  cy="110"
                  r={DIAL_RADIUS}
                  fill="none"
                  strokeWidth="9"
                />
                <circle
                  className="rab-prog"
                  cx="110"
                  cy="110"
                  r={DIAL_RADIUS}
                  fill="none"
                  stroke="url(#rab-grad)"
                  strokeWidth="9"
                  strokeLinecap="round"
                  strokeDasharray={DIAL_CIRCUMFERENCE}
                  strokeDashoffset={strokeOffset}
                  transform="rotate(-90 110 110)"
                />
                <g className="rab-head" style={{ transform: `rotate(${clampedProgress * 3.6}deg)` }}>
                  <circle cx="110" cy="14" r="6" fill="#fff" />
                </g>
              </svg>

              <div className="rab-center">
                <Cpu aria-hidden="true" />
                <span className="rab-pct">{clampedProgress}%</span>
              </div>
            </div>

            {/* Title & Branding */}
            <div>
              <h1 className="rab-name">MOHIT YADAV</h1>
              <p className="rab-sub">CLASS 12 SCIENCE • FUTURE AI ENGINEER</p>
            </div>

            {/* Status and five steps */}
            <div className="rab-statusrow">
              <div className="rab-status" role="status" aria-live="polite">
                <span className="rab-ping" aria-hidden="true" />
                <span className="rab-status-text">{statusText}</span>
              </div>

              <div className="rab-steps" aria-hidden="true">
                {STATUS_MESSAGES.map((_, index) => (
                  <i
                    key={index}
                    className={`rab-step ${
                      allDone || index < stepIndex
                        ? 'is-on'
                        : index === stepIndex
                        ? 'is-now'
                        : ''
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Fast Skip Option */}
            <button type="button" onClick={handleSkip} className="rab-skip">
              [ ESC / CLICK TO ENTER DIRECTLY ]
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
