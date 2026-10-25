import React, { useRef, useState, useEffect } from 'react';

interface MagicTiltCardProps {
  children: React.ReactNode;
  className?: string;
  enableMagicCircle?: boolean;
  glowColor?: 'gold' | 'scarlet' | 'cyan' | 'purple';
}

export const MagicTiltCard: React.FC<MagicTiltCardProps> = ({
  children,
  className = '',
  enableMagicCircle = true,
  glowColor = 'gold',
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [rotX, setRotX] = useState(0);
  const [rotY, setRotY] = useState(0);
  const [sheenX, setSheenX] = useState(50);
  const [sheenY, setSheenY] = useState(50);
  const [isInteracting, setIsInteracting] = useState(false);

  // Touch & Mouse Pointer Parallax
  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    const card = cardRef.current;
    if (!card) return;
    const rect = card.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const px = (x / rect.width) * 2 - 1; // -1 to 1
    const py = (y / rect.height) * 2 - 1; // -1 to 1

    setRotY(px * 10); // max 10 deg tilt
    setRotX(-py * 10);
    setSheenX((x / rect.width) * 100);
    setSheenY((y / rect.height) * 100);
    setIsInteracting(true);
  };

  const handlePointerLeave = () => {
    setRotX(0);
    setRotY(0);
    setIsInteracting(false);
  };

  // Mobile Gyroscope Device Orientation Support
  useEffect(() => {
    const handleOrientation = (e: DeviceOrientationEvent) => {
      if (isInteracting) return; // pointer takes precedence
      if (e.gamma !== null && e.beta !== null) {
        // gamma: left-to-right [-90, 90], beta: front-to-back [-180, 180]
        const clampedY = Math.max(Math.min(e.gamma / 3.5, 9), -9);
        const clampedX = Math.max(Math.min((e.beta - 45) / 4.5, 9), -9);
        setRotY(clampedY);
        setRotX(-clampedX);
      }
    };

    if (typeof window !== 'undefined' && window.DeviceOrientationEvent) {
      window.addEventListener('deviceorientation', handleOrientation, { passive: true });
    }

    return () => {
      if (typeof window !== 'undefined') {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [isInteracting]);

  const circleStroke =
    glowColor === 'scarlet'
      ? 'rgba(225, 29, 72, 0.5)'
      : glowColor === 'cyan'
      ? 'rgba(6, 182, 212, 0.5)'
      : glowColor === 'purple'
      ? 'rgba(168, 85, 247, 0.5)'
      : 'rgba(245, 158, 11, 0.55)';

  return (
    <div
      ref={cardRef}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      style={{
        perspective: 1000,
        transformStyle: 'preserve-3d',
      }}
      className={`relative group ${className}`}
    >
      {/* 3D Tilted Card Body */}
      <div
        style={{
          transform: `rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(${isInteracting ? 1.02 : 1}, ${isInteracting ? 1.02 : 1}, 1)`,
          transition: isInteracting ? 'transform 0.08s ease-out' : 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
          transformStyle: 'preserve-3d',
        }}
        className="w-full h-full relative"
      >
        {/* Doctor Strange Rotating Golden Eldritch Mandala Circle (Behind Card) */}
        {enableMagicCircle && (
          <div
            className="absolute -inset-4 sm:-inset-6 pointer-events-none flex items-center justify-center opacity-30 group-hover:opacity-85 transition-opacity duration-500 -z-10"
            aria-hidden="true"
          >
            <svg
              className="w-full h-full max-w-[420px] max-h-[420px] animate-[spin_24s_linear_infinite]"
              viewBox="0 0 400 400"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Outer runic ring */}
              <circle cx="200" cy="200" r="185" stroke={circleStroke} strokeWidth="1.5" strokeDasharray="6 6" />
              <circle cx="200" cy="200" r="172" stroke={circleStroke} strokeWidth="1" />

              {/* Eldritch 8-Point Sacred Square Stars */}
              <rect
                x="60"
                y="60"
                width="280"
                height="280"
                stroke={circleStroke}
                strokeWidth="1.2"
                transform="rotate(0 200 200)"
              />
              <rect
                x="60"
                y="60"
                width="280"
                height="280"
                stroke={circleStroke}
                strokeWidth="1.2"
                transform="rotate(45 200 200)"
              />

              {/* Inner geometric mandala */}
              <circle cx="200" cy="200" r="115" stroke={circleStroke} strokeWidth="1.5" strokeDasharray="4 8" />
              <circle cx="200" cy="200" r="80" stroke={circleStroke} strokeWidth="1" />

              <polygon
                points="200,125 265,240 135,240"
                stroke={circleStroke}
                strokeWidth="1"
              />
              <polygon
                points="200,275 135,160 265,160"
                stroke={circleStroke}
                strokeWidth="1"
              />
            </svg>
          </div>
        )}

        {/* Dynamic Specular Sheen Layer */}
        {isInteracting && (
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none z-20 opacity-30 transition-opacity"
            style={{
              background: `radial-gradient(circle 280px at ${sheenX}% ${sheenY}%, rgba(251, 191, 36, 0.35), transparent 70%)`,
            }}
          />
        )}

        {/* Real Content */}
        {children}
      </div>
    </div>
  );
};
