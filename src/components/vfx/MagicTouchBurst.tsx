import React, { useEffect, useRef } from 'react';
import { sound } from '../audio/SoundEffects';

interface MagicSpark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  decay: number;
  color: string;
  isRunes?: boolean;
  angle?: number;
  spin?: number;
}

export const MagicTouchBurst: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
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

    const sparks: MagicSpark[] = [];

    // Color palettes inspired by Doctor Strange (Eldritch Gold/Amber) and Wanda (Scarlet/Crimson/Violet)
    const getSectionPalette = (yRatio: number): string[] => {
      if (yRatio < 0.2) {
        // Hero: Eldritch Spark Gold & Wanda Scarlet
        return ['#f59e0b', '#fbbf24', '#f97316', '#e11d48', '#fda4af'];
      } else if (yRatio < 0.4) {
        // Bio & About: Pure Wanda Scarlet Chaos Magic
        return ['#e11d48', '#be123c', '#9333ea', '#c084fc', '#fbbf24'];
      } else if (yRatio < 0.6) {
        // Cyber: Cyan Mystic Sigils & Golden Sparks
        return ['#06b6d4', '#00f0ff', '#38bdf8', '#fbbf24', '#10b981'];
      } else if (yRatio < 0.8) {
        // 3D Obsidian Gallery: Celestial Amber Gold & Deep Crimson
        return ['#fbbf24', '#f59e0b', '#fef08a', '#e11d48', '#8b5cf6'];
      } else {
        // Contact: Full Multiverse Chaos & Eldritch Portal
        return ['#f59e0b', '#e11d48', '#a855f7', '#06b6d4', '#ffffff'];
      }
    };

    const spawnBurst = (x: number, y: number) => {
      sound.playMagicTick();
      sound.triggerHaptic(14);

      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      const scrollRatio = docHeight > 0 ? window.scrollY / docHeight : 0;
      const palette = getSectionPalette(scrollRatio);

      const particleCount = window.innerWidth < 768 ? 16 : 24;
      for (let i = 0; i < particleCount; i++) {
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 4.5 + 1.5;
        const color = palette[Math.floor(Math.random() * palette.length)];
        sparks.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed - 0.5,
          size: Math.random() * 3.5 + 1.5,
          alpha: 1.0,
          decay: Math.random() * 0.025 + 0.02,
          color,
          isRunes: Math.random() > 0.6,
          angle: Math.random() * Math.PI * 2,
          spin: (Math.random() - 0.5) * 0.2,
        });
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      // Don't fire if clicking admin buttons that open modals
      spawnBurst(e.clientX, e.clientY);
    };

    window.addEventListener('pointerdown', handlePointerDown);

    let animId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);

      for (let i = sparks.length - 1; i >= 0; i--) {
        const s = sparks[i];
        s.x += s.vx;
        s.y += s.vy;
        s.vx *= 0.94; // air resistance
        s.vy = s.vy * 0.94 + 0.08; // subtle gravity
        s.alpha -= s.decay;
        if (s.angle !== undefined && s.spin !== undefined) {
          s.angle += s.spin;
        }

        if (s.alpha <= 0) {
          sparks.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(s.alpha, 0);
        ctx.shadowBlur = 10;
        ctx.shadowColor = s.color;
        ctx.fillStyle = s.color;

        if (s.isRunes) {
          // Draw sparkling eldritch diamond spark
          ctx.translate(s.x, s.y);
          ctx.rotate(s.angle || 0);
          ctx.beginPath();
          ctx.moveTo(0, -s.size * 1.5);
          ctx.lineTo(s.size, 0);
          ctx.lineTo(0, s.size * 1.5);
          ctx.lineTo(-s.size, 0);
          ctx.closePath();
          ctx.fill();
        } else {
          // Circular magic ember
          ctx.beginPath();
          ctx.arc(s.x, s.y, s.size, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      animId = requestAnimationFrame(render);
    };
    render();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-50 overflow-hidden"
      aria-hidden="true"
    />
  );
};
