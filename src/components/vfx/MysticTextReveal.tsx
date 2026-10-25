import React from 'react';
import { motion } from 'motion/react';

interface MysticTextRevealProps {
  text: string;
  className?: string;
  delay?: number;
  magicTheme?: 'amber' | 'scarlet' | 'cyan' | 'gold';
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'span';
}

/**
 * MysticTextReveal
 * Doctor Strange & Wanda Maximoff magical character-by-character ethereal reveal.
 * Characters materialize out of glowing embers and mystical smoke into sharp typography.
 */
export const MysticTextReveal: React.FC<MysticTextRevealProps> = ({
  text,
  className = '',
  delay = 0.1,
  magicTheme = 'gold',
  as: Component = 'span',
}) => {
  const words = text.split(' ');

  const initialColor =
    magicTheme === 'scarlet'
      ? 'rgb(244, 63, 94)'
      : magicTheme === 'cyan'
      ? 'rgb(34, 211, 238)'
      : magicTheme === 'amber'
      ? 'rgb(251, 191, 36)'
      : 'rgb(245, 158, 11)';

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: (customDelay: number = delay) => ({
      opacity: 1,
      transition: {
        staggerChildren: 0.025,
        delayChildren: customDelay,
      },
    }),
  };

  const charVariants = {
    hidden: {
      opacity: 0,
      y: 12,
      scale: 0.8,
      filter: 'blur(8px)',
      color: initialColor,
      textShadow: `0 0 16px ${initialColor}`,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      filter: 'blur(0px)',
      color: 'inherit',
      textShadow: 'none',
      transition: {
        duration: 0.45,
        ease: [0.16, 1, 0.3, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.span
      className={`inline-block ${className}`}
      variants={containerVariants}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: '-40px' }}
      custom={delay}
      aria-label={text}
    >
      {words.map((word, wIdx) => (
        <span key={wIdx} className="inline-block whitespace-nowrap mr-[0.28em]">
          {word.split('').map((char, cIdx) => (
            <motion.span
              key={cIdx}
              variants={charVariants}
              className="inline-block transition-colors duration-500"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.span>
  );
};
