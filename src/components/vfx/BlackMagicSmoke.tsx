import React, { useEffect, useState, useRef } from 'react';
import { useImages } from '../../context/ImageContext';

interface BlackMagicSmokeProps {
  children?: React.ReactNode;
  className?: string;
  theme?: 'crimson' | 'multi' | 'darkMagic';
}

interface SmokeWisp {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  maxRadius: number;
  life: number;
  maxLife: number;
  r: number;
  g: number;
  b: number;
  wobbleSpeed: number;
  wobbleAmp: number;
  wobbleSeed: number;
  type: 'smoke' | 'ember';
}

/**
 * BlackMagicSmoke
 * - Real, highly optimized HTML5 canvas-powered rising Black Magic smoke
 * - Smoke curls upward from behind the text, swells, spreads out, and dissipates.
 * - Colors: Deep Crimson Red core mixed with Eldritch Violet, Mystic Blue, and Runic Gold shimmer.
 * - High visibility yet non-intrusive: Renders behind sharp foreground typography (z-0 / z-10).
 * - Mobile-first performance: IntersectionObserver pauses when offscreen; disabled in low-effects mode.
 * - Intensity configurable via Admin (off, low, medium, high). Default is 'medium'.
 */
export const BlackMagicSmoke: React.FC<BlackMagicSmokeProps> = ({
  children,
  className = '',
  theme = 'multi',
}) => {
  const { siteSettings } = useImages();
  const smokeConfig = siteSettings.magicSmoke || {
    enabled: true,
    intensity: 'medium',
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [isLowEffects, setIsLowEffects] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('mohit_low_effects') === 'true';
    }
    return false;
  });

  useEffect(() => {
    const handleLowEffects = (e: Event) => {
      const custom = e as CustomEvent<{ lowEffects: boolean }>;
      setIsLowEffects(custom.detail?.lowEffects ?? false);
    };
    window.addEventListener('mohit_toggle_low_effects', handleLowEffects);
    return () => window.removeEventListener('mohit_toggle_low_effects', handleLowEffects);
  }, []);

  // IntersectionObserver ensures we ONLY compute animation when visible in viewport
  useEffect(() => {
    if (!containerRef.current || isLowEffects || smokeConfig.intensity === 'off' || !smokeConfig.enabled) {
      setIsVisible(false);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { rootMargin: '60px', threshold: 0.05 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isLowEffects, smokeConfig.intensity, smokeConfig.enabled]);

  // Canvas Smoke Particle Animation
  useEffect(() => {
    if (!isVisible || isLowEffects || smokeConfig.intensity === 'off' || !smokeConfig.enabled) {
      return;
    }
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animId: number;
    let width = 0;
    let height = 0;
    const paddingX = 36;
    const paddingY = 32;

    const updateSize = () => {
      if (!container || !canvas) return;
      const rect = container.getBoundingClientRect();
      width = Math.max(Math.round(rect.width + paddingX * 2), 60);
      height = Math.max(Math.round(rect.height + paddingY * 2), 50);
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    updateSize();

    // Palettes: Deep Crimson Red mixed with Violet, Blue, and Gold shimmer
    const pickColor = (isEmber: boolean) => {
      if (isEmber) {
        const rand = Math.random();
        if (rand < 0.45) return { r: 245, g: 158, b: 11 }; // Gold shimmer
        if (rand < 0.75) return { r: 168, g: 85, b: 247 }; // Violet spark
        return { r: 56, g: 189, b: 248 }; // Blue spark
      }
      const rand = Math.random();
      if (theme === 'crimson') {
        if (rand < 0.65) return { r: 220, g: 38, b: 38 }; // Deep crimson
        if (rand < 0.85) return { r: 147, g: 51, b: 234 }; // Violet
        return { r: 245, g: 158, b: 11 }; // Gold
      }
      // 'multi' or 'darkMagic'
      if (rand < 0.45) return { r: 220, g: 38, b: 38 }; // Deep Crimson
      if (rand < 0.70) return { r: 147, g: 51, b: 234 }; // Violet / Purple
      if (rand < 0.88) return { r: 14, g: 165, b: 233 }; // Cyan / Azure Blue
      return { r: 245, g: 158, b: 11 }; // Gold shimmer
    };

    const intensity = smokeConfig.intensity || 'medium';
    const maxParticles = intensity === 'low' ? 14 : intensity === 'high' ? 44 : 26;
    const baseAlpha = intensity === 'low' ? 0.38 : intensity === 'high' ? 0.78 : 0.58;

    const particles: SmokeWisp[] = [];

    const spawnWisp = () => {
      if (particles.length >= maxParticles) return;
      const spawnWidth = Math.max(width - paddingX * 2, 20);
      const isEmber = Math.random() < 0.25;
      const color = pickColor(isEmber);

      const x = paddingX + Math.random() * spawnWidth;
      const y = height - paddingY + (Math.random() - 0.5) * 8;

      particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * (isEmber ? 0.6 : 0.4),
        vy: -(Math.random() * (isEmber ? 1.0 : 0.65) + 0.4),
        radius: isEmber ? Math.random() * 2 + 1.2 : Math.random() * 10 + 9,
        maxRadius: isEmber ? 3 : Math.random() * 28 + 24,
        life: 0,
        maxLife: Math.random() * 35 + (isEmber ? 35 : 45),
        r: color.r,
        g: color.g,
        b: color.b,
        wobbleSpeed: Math.random() * 0.05 + 0.02,
        wobbleAmp: Math.random() * 1.3 + 0.6,
        wobbleSeed: Math.random() * Math.PI * 2,
        type: isEmber ? 'ember' : 'smoke',
      });
    };

    const render = () => {
      spawnWisp();
      if (Math.random() < 0.5) spawnWisp();
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.life++;
        // Natural sine-wave curling upward drift
        p.wobbleSeed += p.wobbleSpeed;
        p.x += p.vx + Math.sin(p.wobbleSeed) * p.wobbleAmp;
        p.y += p.vy;

        // Billow expansion
        if (p.type === 'smoke') {
          p.radius += (p.maxRadius - p.radius) * 0.035;
        }

        const progress = p.life / p.maxLife;
        if (progress >= 1) {
          particles.splice(i, 1);
          continue;
        }

        // Bell curve alpha: fast smooth ramp-in, gentle dissipation
        const alphaCurve = Math.sin(progress * Math.PI);
        const currentAlpha = alphaCurve * baseAlpha;

        if (currentAlpha <= 0.01) continue;

        if (p.type === 'ember') {
          // Sharp glowing spark particle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.r}, ${p.g}, ${p.b}, ${Math.min(currentAlpha * 1.3, 0.95)})`;
          ctx.shadowColor = `rgba(${p.r}, ${p.g}, ${p.b}, 0.8)`;
          ctx.shadowBlur = 6;
          ctx.fill();
          ctx.shadowBlur = 0;
        } else {
          // Soft feathered multi-spectral smoke puff
          const grad = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, p.radius);
          grad.addColorStop(0, `rgba(${p.r}, ${p.g}, ${p.b}, ${currentAlpha})`);
          grad.addColorStop(0.35, `rgba(${p.r}, ${p.g}, ${p.b}, ${currentAlpha * 0.65})`);
          grad.addColorStop(0.7, `rgba(${p.r}, ${p.g}, ${p.b}, ${currentAlpha * 0.22})`);
          grad.addColorStop(1, `rgba(${p.r}, ${p.g}, ${p.b}, 0)`);
          ctx.fillStyle = grad;
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      animId = requestAnimationFrame(render);
    };

    render();

    const handleResize = () => {
      updateSize();
    };
    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
    };
  }, [isVisible, isLowEffects, smokeConfig.intensity, smokeConfig.enabled, theme]);

  const isSmokeActive = !isLowEffects && smokeConfig.intensity !== 'off' && smokeConfig.enabled;
  const isFullWidth = className.includes('w-full') || className.includes('block');
  const displayClass = isFullWidth ? 'block w-full' : 'inline-block';

  return (
    <div ref={containerRef} className={`relative ${displayClass} ${className}`}>
      {/* Real High-Visibility Rising Black Magic Smoke */}
      {isSmokeActive && (
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute -top-[32px] -left-[36px] pointer-events-none z-0 overflow-visible transition-opacity duration-500"
          style={{
            width: 'calc(100% + 72px)',
            height: 'calc(100% + 64px)',
          }}
        />
      )}
      {/* Typography content remains sharp, vibrant, and readable on top */}
      <div className="relative z-10 w-full">{children}</div>
    </div>
  );
};
