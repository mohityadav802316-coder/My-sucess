import React, { useRef, useState, useEffect } from 'react';

interface MysticTiltCardProps {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  glowTheme?: 'gold' | 'scarlet' | 'cyan' | 'multiverse';
  onClick?: () => void;
}

/**
 * MysticTiltCard
 * 3D Tilt Card infused with Doctor Strange Eldritch / Wanda Chaos Magic aura.
 * Responds interactively to mouse move, touch drag, and mobile gyroscope tilt.
 * Includes dynamic light specular sheen and mystical runic border glow.
 */
export const MysticTiltCard: React.FC<MysticTiltCardProps> = ({
  children,
  className = '',
  maxTilt = 12,
  glowTheme = 'gold',
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement | null>(null);
  const [transform, setTransform] = useState<string>('perspective(1000px) rotateX(0deg) rotateY(0deg)');
  const [glarePos, setGlarePos] = useState<{ x: number; y: number; opacity: number }>({
    x: 50,
    y: 50,
    opacity: 0,
  });

  const getAuraClasses = () => {
    switch (glowTheme) {
      case 'scarlet':
        return 'border-rose-500/40 shadow-[0_0_25px_rgba(225,29,72,0.25)] hover:border-rose-400/70 hover:shadow-[0_0_35px_rgba(225,29,72,0.45)]';
      case 'cyan':
        return 'border-cyan-500/40 shadow-[0_0_25px_rgba(6,182,212,0.25)] hover:border-cyan-400/70 hover:shadow-[0_0_35px_rgba(6,182,212,0.45)]';
      case 'multiverse':
        return 'border-purple-500/40 shadow-[0_0_25px_rgba(168,85,247,0.25)] hover:border-amber-400/70 hover:shadow-[0_0_35px_rgba(245,158,11,0.45)]';
      case 'gold':
      default:
        return 'border-amber-500/40 shadow-[0_0_25px_rgba(245,158,11,0.25)] hover:border-amber-300/80 hover:shadow-[0_0_40px_rgba(245,158,11,0.5)]';
    }
  };

  const getGlareColor = () => {
    switch (glowTheme) {
      case 'scarlet':
        return 'radial-gradient(circle at %X% %Y%, rgba(244,63,94,0.35) 0%, rgba(225,29,72,0.1) 40%, transparent 75%)';
      case 'cyan':
        return 'radial-gradient(circle at %X% %Y%, rgba(34,211,238,0.35) 0%, rgba(6,182,212,0.1) 40%, transparent 75%)';
      case 'multiverse':
        return 'radial-gradient(circle at %X% %Y%, rgba(251,191,36,0.3) 0%, rgba(168,85,247,0.2) 40%, transparent 75%)';
      case 'gold':
      default:
        return 'radial-gradient(circle at %X% %Y%, rgba(253,224,71,0.35) 0%, rgba(245,158,11,0.15) 45%, transparent 75%)';
    }
  };

  const updateTilt = (clientX: number, clientY: number) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    const xPct = Math.max(0, Math.min(1, x / rect.width));
    const yPct = Math.max(0, Math.min(1, y / rect.height));

    const rotX = (0.5 - yPct) * maxTilt * 2;
    const rotY = (xPct - 0.5) * maxTilt * 2;

    setTransform(`perspective(1000px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg) scale3d(1.02, 1.02, 1.02)`);
    setGlarePos({
      x: xPct * 100,
      y: yPct * 100,
      opacity: 0.9,
    });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    updateTilt(e.clientX, e.clientY);
  };

  const handleMouseLeave = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (e.touches.length > 0) {
      updateTilt(e.touches[0].clientX, e.touches[0].clientY);
    }
  };

  const handleTouchEnd = () => {
    setTransform('perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)');
    setGlarePos((prev) => ({ ...prev, opacity: 0 }));
  };

  // Optional Gyroscope tilt on mobile
  useEffect(() => {
    let handleOrientation: ((e: DeviceOrientationEvent) => void) | null = null;

    if (typeof window !== 'undefined' && 'DeviceOrientationEvent' in window) {
      handleOrientation = (e: DeviceOrientationEvent) => {
        // gamma is left-to-right [-90, 90], beta is front-to-back [-180, 180]
        if (e.gamma !== null && e.beta !== null) {
          const clampedGamma = Math.max(-25, Math.min(25, e.gamma));
          const clampedBeta = Math.max(10, Math.min(70, e.beta)) - 40; // centered ~40deg tilt

          const rotY = (clampedGamma / 25) * (maxTilt * 0.7);
          const rotX = -(clampedBeta / 30) * (maxTilt * 0.7);

          setTransform(`perspective(1000px) rotateX(${rotX.toFixed(1)}deg) rotateY(${rotY.toFixed(1)}deg)`);
        }
      };

      // Only attach if user is on mobile
      if (window.innerWidth < 1024) {
        window.addEventListener('deviceorientation', handleOrientation, { passive: true });
      }
    }

    return () => {
      if (handleOrientation) {
        window.removeEventListener('deviceorientation', handleOrientation);
      }
    };
  }, [maxTilt]);

  const glareStyle = {
    background: getGlareColor()
      .replace('%X%', `${glarePos.x}%`)
      .replace('%Y%', `${glarePos.y}%`),
    opacity: glarePos.opacity,
  };

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onClick={onClick}
      style={{
        transform,
        transition: 'transform 0.15s ease-out',
        transformStyle: 'preserve-3d',
      }}
      className={`relative rounded-3xl overflow-hidden border backdrop-blur-xl ${getAuraClasses()} ${className}`}
    >
      {/* Dynamic Mystic Glare */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-300 z-10"
        style={glareStyle}
        aria-hidden="true"
      />

      {/* Runic Corner Glyphs */}
      <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-amber-400/60 pointer-events-none z-10" />
      <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-rose-400/60 pointer-events-none z-10" />
      <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-rose-400/60 pointer-events-none z-10" />
      <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-amber-400/60 pointer-events-none z-10" />

      {/* Card Content */}
      <div className="relative z-0 h-full">{children}</div>
    </div>
  );
};
