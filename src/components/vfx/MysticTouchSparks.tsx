import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  radius: number;
  color: string;
  glowColor: string;
  alpha: number;
  decay: number;
  rotation: number;
  vRot: number;
  isRuneSpark: boolean;
  length: number;
}

/**
 * MysticTouchSparks
 * Doctor Strange Eldritch & Wanda Chaos Magic particle burst on touch/pointer.
 * Explodes unique magical sparks, rune fragments, and glowing chaos embers on contact.
 * Adapts colors dynamically according to the underlying section.
 */
export const MysticTouchSparks: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      if (!canvas) return;
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', handleResize);

    const particles: Particle[] = [];
    let animationFrameId: number | null = null;

    // Palette generator based on section ID
    const getPalette = (sectionId: string) => {
      switch (sectionId) {
        case 'about':
          // Wanda Scarlet & Chaos Violet
          return {
            colors: ['#e11d48', '#f43f5e', '#be123c', '#c084fc', '#fb7185'],
            glow: '#e11d48',
          };
        case 'cybersecurity':
          // Astral Cyan & Eldritch Gold
          return {
            colors: ['#06b6d4', '#22d3ee', '#38bdf8', '#fbbf24', '#f59e0b'],
            glow: '#06b6d4',
          };
        case 'gallery':
          // Obsidian Multiverse Violet & Amber
          return {
            colors: ['#a855f7', '#c084fc', '#9333ea', '#fbbf24', '#f59e0b'],
            glow: '#a855f7',
          };
        case 'roadmap':
          // Time Stone Emerald & Gold
          return {
            colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#d97706'],
            glow: '#10b981',
          };
        case 'skills':
        case 'projects':
          // Wanda Crimson & Strange Amber Fusion
          return {
            colors: ['#f59e0b', '#fbbf24', '#e11d48', '#f43f5e', '#ffffff'],
            glow: '#f59e0b',
          };
        case 'contact':
          // Dimensional Portal Blaze
          return {
            colors: ['#f59e0b', '#e11d48', '#fb923c', '#facc15', '#ffffff'],
            glow: '#f59e0b',
          };
        case 'hero':
        default:
          // Doctor Strange Eldritch Amber & Gold
          return {
            colors: ['#f59e0b', '#fbbf24', '#f59e0b', '#f97316', '#ffedd5'],
            glow: '#f59e0b',
          };
      }
    };

    const spawnBurst = (x: number, y: number) => {
      const isLowEffects =
        typeof window !== 'undefined' &&
        localStorage.getItem('mohit_low_effects') === 'true';
      if (isLowEffects) return;

      // Cap maximum active particles to prevent FPS drops
      if (particles.length >= 40) {
        particles.splice(0, particles.length - 20);
      }

      // Find current section
      const targetElem = document.elementFromPoint(x, y);
      const section = targetElem?.closest('section');
      const sectionId = section?.id || 'hero';
      const palette = getPalette(sectionId);

      const isMobile = window.innerWidth < 768;
      const count = isMobile ? 12 : 20;
      for (let i = 0; i < count; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        const color = palette.colors[Math.floor(Math.random() * palette.colors.length)];
        const isRune = Math.random() > 0.45;

        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          radius: Math.random() * 2.5 + 1.0,
          color,
          glowColor: palette.glow,
          alpha: 1,
          decay: Math.random() * 0.025 + 0.02, // ~1s lifespan for fast cleanup
          rotation: Math.random() * Math.PI,
          vRot: (Math.random() - 0.5) * 0.25,
          isRuneSpark: isRune,
          length: Math.random() * 10 + 5,
        });
      }

      if (!animationFrameId) {
        render();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      spawnBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const isMobile = window.innerWidth < 768;

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94; // air drag
        p.vy *= 0.94;
        p.vy += 0.06; // mystic gravity
        p.rotation += p.vRot;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);

        if (p.isRuneSpark) {
          // Linear glowing spark streak
          ctx.strokeStyle = p.color;
          ctx.lineWidth = p.radius * 0.8;
          if (!isMobile) {
            ctx.shadowBlur = 6;
            ctx.shadowColor = p.glowColor;
          }
          ctx.beginPath();
          ctx.moveTo(-p.length / 2, 0);
          ctx.lineTo(p.length / 2, 0);
          ctx.stroke();
        } else {
          // Circular mana spore
          ctx.fillStyle = p.color;
          if (!isMobile) {
            ctx.shadowBlur = 8;
            ctx.shadowColor = p.glowColor;
          }
          ctx.beginPath();
          ctx.arc(0, 0, p.radius, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      if (particles.length > 0) {
        animationFrameId = requestAnimationFrame(render);
      } else {
        animationFrameId = null;
      }
    };

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30 overflow-hidden"
      aria-hidden="true"
    />
  );
};
