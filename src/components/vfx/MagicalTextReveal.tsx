import React, { useState } from 'react';
import { motion } from 'motion/react';
import { sound } from '../audio/SoundEffects';

interface MagicalTextRevealProps {
  text: string;
  as?: 'h1' | 'h2' | 'h3' | 'span';
  className?: string;
  glow?: 'gold' | 'scarlet' | 'cyan' | 'purple';
}

export const MagicalTextReveal: React.FC<MagicalTextRevealProps> = ({
  text,
  as = 'h2',
  className = '',
  glow = 'gold',
}) => {
  const [isGlitching, setIsGlitching] = useState(false);

  const glowStyle =
    glow === 'scarlet'
      ? 'drop-shadow-[0_2px_15px_rgba(225,29,72,0.6)]'
      : glow === 'cyan'
      ? 'drop-shadow-[0_2px_15px_rgba(6,182,212,0.6)]'
      : glow === 'purple'
      ? 'drop-shadow-[0_2px_15px_rgba(168,85,247,0.6)]'
      : 'drop-shadow-[0_2px_18px_rgba(245,158,11,0.6)]';

  const letters = Array.from(text);

  const handleTouch = () => {
    sound.playMagicTick();
    sound.triggerHaptic(10);
    setIsGlitching(true);
    setTimeout(() => setIsGlitching(false), 500);
  };

  const Component: any = (motion as any)[as] || motion.h2;

  return (
    <Component
      onClick={handleTouch}
      onMouseEnter={handleTouch}
      className={`inline-block select-none cursor-pointer tracking-wide ${glowStyle} ${
        isGlitching ? 'animate-pulse scale-[1.01]' : ''
      } ${className}`}
    >
      {letters.map((char, index) => (
        <motion.span
          key={`${char}-${index}`}
          initial={{ opacity: 0, y: 12, filter: 'blur(8px)' }}
          whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          viewport={{ once: true }}
          transition={{
            duration: 0.5,
            delay: index * 0.03,
            ease: [0.16, 1, 0.3, 1],
          }}
          className={`inline-block ${
            isGlitching
              ? index % 2 === 0
                ? 'text-amber-300 translate-y-[-1px]'
                : 'text-rose-400 translate-y-[1px]'
              : ''
          }`}
        >
          {char === ' ' ? '\u00A0' : char}
        </motion.span>
      ))}
    </Component>
  );
};
