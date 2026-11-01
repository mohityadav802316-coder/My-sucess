
import React, { useEffect, useRef } from 'react';

export const CyberBackground: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId = 0;
    let width = 0;
    let height = 0;
    let tick = 0;
    let isVisible = !document.hidden;

    const GOLD = '#D4AF37';

    const resizeCanvas = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);

      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);

      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();

    interface Particle {
      x: number;
      y: number;
      size: number;
      speedY: number;
      speedX: number;
      opacity: number;
      phase: number;
    }

    const isMobile = () => width < 768;

    const particleCount = () =>
      isMobile() ? 22 : 45;

    let particles: Particle[] = [];

    const createParticles = () => {
      particles = Array.from(
        { length: particleCount() },
        () => ({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.3 + 0.4,
          speedY: Math.random() * 0.22 + 0.06,
          speedX: (Math.random() - 0.5) * 0.12,
          opacity: Math.random() * 0.35 + 0.12,
          phase: Math.random() * Math.PI * 2,
        })
      );
    };

    createParticles();

    const drawBackground = () => {
      // Deep matte black base
      ctx.fillStyle = '#050505';
      ctx.fillRect(0, 0, width, height);

      // Subtle luxury gold ambient lighting
      const goldGlow = ctx.createRadialGradient(
        width * 0.78,
        height * 0.22,
        0,
        width * 0.78,
        height * 0.22,
        width * 0.58
      );

      goldGlow.addColorStop(0, 'rgba(212, 175, 55, 0.075)');
      goldGlow.addColorStop(0.45, 'rgba(184, 134, 11, 0.025)');
      goldGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = goldGlow;
      ctx.fillRect(0, 0, width, height);

      // Soft secondary golden light
      const secondaryGlow = ctx.createRadialGradient(
        width * 0.12,
        height * 0.82,
        0,
        width * 0.12,
        height * 0.82,
        width * 0.48
      );

      secondaryGlow.addColorStop(0, 'rgba(212, 175, 55, 0.045)');
      secondaryGlow.addColorStop(1, 'rgba(0, 0, 0, 0)');

      ctx.fillStyle = secondaryGlow;
      ctx.fillRect(0, 0, width, height);
    };

    const drawParticles = () => {
      const mobile = isMobile();

      particles.forEach((particle, index) => {
        particle.y -= particle.speedY;
        particle.x += particle.speedX;

        if (particle.y < -10) {
          particle.y = height + 10;
          particle.x = Math.random() * width;
        }

        if (particle.x < -5) particle.x = width + 5;
        if (particle.x > width + 5) particle.x = -5;

        const pulse =
          0.75 + Math.sin(tick + particle.phase + index) * 0.25;

        const opacity = particle.opacity * pulse;

        ctx.beginPath();
        ctx.arc(
          particle.x,
          particle.y,
          particle.size,
          0,
          Math.PI * 2
        );

        ctx.fillStyle = `rgba(212, 175, 55, ${opacity})`;

        if (!mobile) {
          ctx.shadowBlur = 5;
          ctx.shadowColor = GOLD;
        }

        ctx.fill();
      });

      ctx.shadowBlur = 0;
    };

    const render = () => {
      if (!isVisible) return;

      tick += 0.012;

      drawBackground();
      drawParticles();

      animationFrameId = requestAnimationFrame(render);
    };

    const handleVisibilityChange = () => {
      isVisible = !document.hidden;

      cancelAnimationFrame(animationFrameId);

      if (isVisible) {
        render();
      }
    };

    const handleResize = () => {
      resizeCanvas();
      createParticles();
      drawBackground();
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    window.addEventListener('resize', handleResize);

    drawBackground();

    if (isVisible) {
      render();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);

      window.removeEventListener('resize', handleResize);

      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        opacity: 1,
        backgroundColor: '#050505',
      }}
      aria-hidden="true"
    />
  );
};
