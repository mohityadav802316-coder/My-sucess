import React, { useEffect, useRef } from 'react';

interface DivineLightSweepProps {
  isSweeping: boolean;
  durationMs?: number;
  onMidpoint?: () => void;
  onComplete?: () => void;
}

export const DivineLightSweep: React.FC<DivineLightSweepProps> = ({
  isSweeping,
  durationMs = 700,
  onMidpoint,
  onComplete,
}) => {
  const midpointFiredRef = useRef(false);
  const onMidpointRef = useRef(onMidpoint);
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onMidpointRef.current = onMidpoint;
    onCompleteRef.current = onComplete;
  }, [onMidpoint, onComplete]);

  useEffect(() => {
    if (!isSweeping) {
      midpointFiredRef.current = false;
      return;
    }

    midpointFiredRef.current = false;

    const midpointTimer = window.setTimeout(() => {
      if (midpointFiredRef.current) return;

      midpointFiredRef.current = true;
      onMidpointRef.current?.();
    }, durationMs * 0.45);

    const completeTimer = window.setTimeout(() => {
      onCompleteRef.current?.();
    }, durationMs);

    return () => {
      window.clearTimeout(midpointTimer);
      window.clearTimeout(completeTimer);
    };
  }, [isSweeping, durationMs]);

  if (!isSweeping) return null;

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-30 overflow-hidden rounded-[inherit]"
    >
      <style>{`
        @keyframes divineLuxuryBlade {
          0% {
            transform: translate3d(0, -125%, 0);
            opacity: 0;
          }
          12% {
            opacity: 1;
          }
          45% {
            transform: translate3d(0, 0%, 0);
            opacity: 1;
          }
          70% {
            opacity: 0.9;
          }
          100% {
            transform: translate3d(0, 125%, 0);
            opacity: 0;
          }
        }

        @keyframes divineLuxuryPeak {
          0% {
            opacity: 0;
          }
          25% {
            opacity: 0.18;
          }
          38% {
            opacity: 0.8;
          }
          45% {
            opacity: 1;
          }
          54% {
            opacity: 0.96;
          }
          72% {
            opacity: 0.42;
          }
          100% {
            opacity: 0;
          }
        }

        @keyframes divineLuxuryFlare {
          0% {
            transform: translate3d(-115%, 0, 0) rotate(-18deg);
            opacity: 0;
          }
          30% {
            opacity: 0.2;
          }
          45% {
            opacity: 1;
          }
          65% {
            opacity: 0.75;
          }
          100% {
            transform: translate3d(115%, 0, 0) rotate(-18deg);
            opacity: 0;
          }
        }

        @keyframes divineLuxurySparkles {
          0% {
            opacity: 0;
            transform: scale(0.85);
          }
          35% {
            opacity: 0.5;
          }
          48% {
            opacity: 1;
            transform: scale(1.08);
          }
          100% {
            opacity: 0;
            transform: scale(1.2);
          }
        }

        .divine-luxury-blade {
          animation: divineLuxuryBlade ${durationMs}ms cubic-bezier(0.2, 0.85, 0.25, 1) forwards;
          will-change: transform, opacity;
        }

        .divine-luxury-peak {
          animation: divineLuxuryPeak ${durationMs}ms ease-in-out forwards;
          will-change: opacity;
        }

        .divine-luxury-flare {
          animation: divineLuxuryFlare ${durationMs}ms ease-in-out forwards;
          will-change: transform, opacity;
        }

        .divine-luxury-sparkles {
          animation: divineLuxurySparkles ${durationMs}ms ease-out forwards;
          will-change: opacity, transform;
        }

        @media (prefers-reduced-motion: reduce) {
          .divine-luxury-blade,
          .divine-luxury-peak,
          .divine-luxury-flare,
          .divine-luxury-sparkles {
            animation-duration: 400ms;
          }
        }
      `}</style>

      {/* Full-stage pearl and champagne light curtain.
          At peak brightness this covers the old photo during the swap. */}
      <div
        className="divine-luxury-peak absolute inset-0"
        style={{
          background:
            'linear-gradient(180deg, rgba(246,235,204,0.97) 0%, rgba(255,255,255,0.99) 35%, rgba(255,248,231,1) 50%, rgba(232,213,173,0.98) 75%, rgba(18,16,12,0.82) 100%)',
          mixBlendMode: 'screen',
        }}
      />

      {/* Main vertical champagne-gold beam */}
      <div className="divine-luxury-blade absolute -top-[40%] inset-x-0 flex h-[180%] flex-col items-center justify-center">
        {/* Wide outer gold glow */}
        <div
          className="h-52 w-full blur-2xl"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(166,122,43,0.25) 25%, rgba(212,175,95,0.82) 42%, rgba(255,246,221,1) 50%, rgba(212,175,95,0.82) 58%, rgba(166,122,43,0.25) 75%, transparent 100%)',
          }}
        />

        {/* Pearl-white central beam */}
        <div
          className="h-32 w-full blur-md"
          style={{
            background:
              'linear-gradient(180deg, transparent 0%, rgba(212,175,95,0.5) 24%, rgba(246,235,204,0.98) 42%, rgba(255,255,255,1) 50%, rgba(246,235,204,0.98) 58%, rgba(212,175,95,0.5) 76%, transparent 100%)',
          }}
        />

        {/* Fine silver-white highlight */}
        <div
          className="h-2.5 w-full"
          style={{
            background:
              'linear-gradient(90deg, transparent 0%, rgba(199,208,220,0.7) 20%, rgba(255,255,255,1) 50%, rgba(199,208,220,0.7) 80%, transparent 100%)',
            boxShadow:
              '0 0 22px 9px rgba(255,255,255,0.95), 0 0 65px 25px rgba(212,175,95,0.8)',
          }}
        />
      </div>

      {/* Diagonal silver reflection crossing the stage */}
      <div className="divine-luxury-flare absolute -inset-x-[45%] top-0 h-full">
        <div
          className="h-full w-[32%] blur-xl"
          style={{
            background:
              'linear-gradient(90deg, transparent, rgba(199,208,220,0.35), rgba(255,255,255,0.9), rgba(246,235,204,0.45), transparent)',
          }}
        />
      </div>

      {/* Fine metallic sparkle layer */}
      <div className="divine-luxury-sparkles absolute inset-0 mix-blend-screen">
        <div
          className="h-full w-full"
          style={{
            backgroundImage: `
              radial-gradient(circle at 12% 22%, rgba(255,255,255,0.95) 1px, transparent 2px),
              radial-gradient(circle at 28% 68%, rgba(212,175,95,0.95) 1.5px, transparent 2.5px),
              radial-gradient(circle at 72% 26%, rgba(199,208,220,0.9) 1px, transparent 2px),
              radial-gradient(circle at 86% 74%, rgba(246,235,204,0.95) 1.5px, transparent 2.5px),
              radial-gradient(circle at 50% 50%, rgba(255,255,255,0.9) 1px, transparent 2px)
            `,
            backgroundSize:
              '100% 100%, 100% 100%, 100% 100%, 100% 100%, 28px 28px',
          }}
        />
      </div>

      {/* Soft finishing silver and gold edge reflections */}
      <div
        className="absolute inset-x-0 top-0 h-20"
        style={{
          background:
            'linear-gradient(180deg, rgba(199,208,220,0.2), transparent)',
        }}
      />

      <div
        className="absolute inset-x-0 bottom-0 h-24"
        style={{
          background:
            'linear-gradient(0deg, rgba(212,175,95,0.24), transparent)',
        }}
      />
    </div>
  );
};