import React from 'react';
import { motion, type Variants } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';

/* Fonts (index.html में एक बार):
   https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap */

const TOKENS = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--line': 'rgba(212,175,95,0.22)',
  '--line-strong': 'rgba(212,175,95,0.55)',
} as React.CSSProperties;

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(120deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const EASE = [0.22, 1, 0.36, 1] as const;
const block: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.15 } },
};
const word: Variants = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

export const VisionSection: React.FC = () => {
  const { mode } = useLanguage();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  const quote = t(
    'Bridging the discipline of Class 12 Science with continuous Python engineering to build real, autonomous AI systems.',
    'कक्षा 12 विज्ञान के अनुशासन को निरंतर पायथन प्रोग्रामिंग के साथ जोड़कर वास्तविक, स्वायत्त AI सिस्टम का निर्माण करना।'
  );

  return (
    <section
      id="vision"
      style={TOKENS}
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 select-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-[380px] w-[760px] -translate-x-1/2 -translate-y-1/2 opacity-[0.12] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <motion.div
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-80px' }}
        className="relative mx-auto max-w-4xl text-center"
      >
        <motion.span
          variants={rise}
          className="block text-[10px] font-semibold uppercase tracking-[0.3em]"
          style={{ color: 'var(--gold)' }}
        >
          {t('Vision', 'दृष्टि')}
        </motion.span>

        <motion.div variants={rise} aria-hidden className="mx-auto mt-8 h-14 w-px" style={{ background: 'linear-gradient(to bottom, transparent, var(--line-strong))' }} />

        <motion.span
          variants={rise}
          aria-hidden
          className="mt-4 block select-none text-[90px] font-light leading-[0.6] opacity-60"
          style={{ ...SERIF, ...GOLD_TEXT }}
        >
          &ldquo;
        </motion.span>

        <motion.blockquote
          variants={block}
          className="mt-4 text-3xl font-light leading-[1.3] sm:text-4xl lg:text-5xl"
          style={{ ...SERIF, color: 'var(--text)' }}
        >
          {quote.split(' ').map((w, i) => (
            <motion.span key={i} variants={word} className="inline-block pr-[0.28em]">
              {w}
            </motion.span>
          ))}
        </motion.blockquote>

        <motion.div variants={rise} aria-hidden className="mx-auto mt-10 h-px w-20" style={{ background: 'linear-gradient(to right, transparent, var(--gold), transparent)' }} />

        <motion.div variants={rise} className="mt-8">
          <p className="text-2xl font-normal" style={{ ...SERIF, ...GOLD_TEXT }}>
            Mohit Yadav
          </p>
          <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--muted)' }}>
            {t('Aspiring AI Engineer', 'भावी AI इंजीनियर')}  ·  {t('Bihar, India', 'बिहार, भारत')}
          </p>
        </motion.div>
      </motion.div>
    </section>
  );
};
