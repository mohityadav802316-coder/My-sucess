
import React, { useEffect, useRef } from 'react';

interface CinematicCanvas3DProps {
  isPaused?: boolean;
}

export const CinematicCanvas3D: React.FC<CinematicCanvas3DProps> = ({
  isPaused = false,
}) => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const pausedRef = useRef(isPaused);

  useEffect(() => {
    pausedRef.current = isPaused;
  }, [isPaused]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const style = document.createElement('style');

    style.textContent = `
      .luxury-bg {
        position: fixed;
        inset: 0;
        z-index: 0;
        overflow: hidden;
        pointer-events: none;
        background: #050505;
        isolation: isolate;
      }

      .luxury-glow {
        position: absolute;
        width: 75vw;
        height: 75vw;
        max-width: 850px;
        max-height: 850px;
        border-radius: 50%;
        filter: blur(110px);
        opacity: 0.12;
        background: radial-gradient(
          circle,
          rgba(212, 175, 55, 0.5) 0%,
          rgba(212, 175, 55, 0.12) 35%,
          transparent 70%
        );
        animation: luxuryGlow 18s ease-in-out infinite alternate;
        will-change: transform;
      }

      .luxury-glow-one {
        top: -35%;
        left: -25%;
      }

      .luxury-glow-two {
        right: -35%;
        bottom: -45%;
        opacity: 0.08;
        animation-delay: -9s;
      }

      .luxury-silver-glow {
        position: absolute;
        width: 50vw;
        height: 50vw;
        max-width: 550px;
        max-height: 550px;
        top: 35%;
        left: 25%;
        border-radius: 50%;
        background: radial-gradient(
          circle,
          rgba(190, 190, 190, 0.045),
          transparent 70%
        );
        filter: blur(100px);
      }

      .luxury-particles {
        position: absolute;
        inset: 0;
      }

      .luxury-particle {
        position: absolute;
        width: 2px;
        height: 2px;
        border-radius: 50%;
        background: #d4af37;
        box-shadow: 0 0 8px rgba(212, 175, 55, 0.65);
        opacity: 0;
        animation: luxuryFloat var(--duration) ease-in-out infinite;
        animation-delay: var(--delay);
      }

      @keyframes luxuryFloat {
        0% {
          transform: translate3d(0, 15px, 0);
          opacity: 0;
        }
        25% {
          opacity: 0.45;
        }
        70% {
          opacity: 0.25;
        }
        100% {
          transform: translate3d(var(--drift), -100px, 0);
          opacity: 0;
        }
      }

      @keyframes luxuryGlow {
        from {
          transform: translate3d(-3%, 0, 0) scale(0.95);
        }
        to {
          transform: translate3d(5%, 4%, 0) scale(1.08);
        }
      }

      .luxury-bg.is-paused *,
      .luxury-bg.is-paused *::before,
      .luxury-bg.is-paused *::after {
        animation-play-state: paused !important;
      }

      @media (max-width: 767px) {
        .luxury-glow {
          filter: blur(75px);
          opacity: 0.09;
        }

        .luxury-silver-glow {
          filter: blur(70px);
        }

        .luxury-particle {
          box-shadow: 0 0 5px rgba(212, 175, 55, 0.45);
        }
      }

      @media (prefers-reduced-motion: reduce) {
        .luxury-bg *,
        .luxury-bg *::before,
        .luxury-bg *::after {
          animation: none !important;
        }

        .luxury-particle {
          display: none;
        }
      }
    `;

    document.head.appendChild(style);

    const particleContainer = document.createElement('div');
    particleContainer.className = 'luxury-particles';

    const isMobile = window.innerWidth < 768;
    const particleCount = isMobile ? 12 : 24;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('span');

      particle.className = 'luxury-particle';

      particle.style.left = `${Math.random() * 100}%`;
      particle.style.top = `${Math.random() * 100}%`;
      particle.style.setProperty(
        '--duration',
        `${8 + Math.random() * 10}s`
      );
      particle.style.setProperty(
        '--delay',
        `${-Math.random() * 15}s`
      );
      particle.style.setProperty(
        '--drift',
        `${Math.random() * 50 - 25}px`
      );

      particleContainer.appendChild(particle);
    }

    container.innerHTML = `
      <div class="luxury-glow luxury-glow-one"></div>
      <div class="luxury-glow luxury-glow-two"></div>
      <div class="luxury-silver-glow"></div>
    `;

    container.appendChild(particleContainer);

    const updatePauseState = () => {
      const shouldPause = pausedRef.current || document.hidden;
      container.classList.toggle('is-paused', shouldPause);
    };

    const handleVisibilityChange = () => {
      updatePauseState();
    };

    document.addEventListener(
      'visibilitychange',
      handleVisibilityChange
    );

    updatePauseState();

    return () => {
      document.removeEventListener(
        'visibilitychange',
        handleVisibilityChange
      );

      style.remove();
      container.innerHTML = '';
    };
  }, []);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.classList.toggle(
      'is-paused',
      isPaused || document.hidden
    );
  }, [isPaused]);

  return (
    <div
      ref={containerRef}
      className="luxury-bg"
      aria-hidden="true"
    />
  );
};

export default CinematicCanvas3D;
