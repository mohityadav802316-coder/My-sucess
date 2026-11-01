import React, { useRef } from 'react';
import { motion, useScroll, useSpring, type Variants } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';

/* Fonts (index.html में एक बार):
   https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap */

const TOKENS = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--panel': '#0C0B09',
  '--line': 'rgba(212,175,95,0.2)',
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
const rise: Variants = {
  hidden: { opacity: 0, y: 26 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

type Kind = 'done' | 'active' | 'future';
const getKind = (s: string): Kind => (s === 'completed' ? 'done' : s === 'in-progress' ? 'active' : 'future');
const DEFAULT_LABEL: Record<Kind, { en: string; hi: string }> = {
  done: { en: 'Completed', hi: 'पूर्ण' },
  active: { en: 'In progress', hi: 'जारी' },
  future: { en: 'Upcoming', hi: 'आगामी' },
};

/* सुनहरा बिंदु: पूर्ण = ठोस, जारी = धड़कता हुआ, आगामी = खोखला */
const Node: React.FC<{ kind: Kind }> = ({ kind }) => (
  <span className="relative flex h-4 w-4 items-center justify-center">
    {kind === 'active' && (
      <span className="absolute -inset-2 animate-ping rounded-full border opacity-40" style={{ borderColor: 'var(--gold)' }} />
    )}
    <span
      className="h-4 w-4 rounded-full border-2"
      style={{
        borderColor: 'var(--gold)',
        background: kind === 'future' ? '#070707' : 'var(--gold)',
        boxShadow: kind === 'future' ? 'none' : '0 0 0 5px rgba(212,175,95,0.14), 0 0 18px rgba(212,175,95,0.5)',
      }}
    />
  </span>
);

export const RoadmapSection: React.FC = () => {
  const { mode } = useLanguage();
  const { milestones } = useImages();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  // Scroll करते ही सुनहरी रेखा भरती जाती है
  const trackRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: trackRef, offset: ['start 70%', 'end 60%'] });
  const fill = useSpring(scrollYProgress, { stiffness: 90, damping: 24, mass: 0.4 });

  // Spotlight: कर्सर के साथ चलती रोशनी
  const onMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--mx', `${e.clientX - r.left}px`);
    el.style.setProperty('--my', `${e.clientY - r.top}px`);
  };

  return (
    <section
      id="roadmap"
      style={TOKENS}
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-28 lg:px-10 select-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[400px] w-[760px] -translate-x-1/2 opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        <motion.header
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-16 max-w-2xl sm:mb-20"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            {t('Roadmap', 'यात्रा')}
          </span>
          <h2 className="mt-4 text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl" style={{ ...SERIF, ...GOLD_TEXT }}>
            {t('My Journey', 'मेरी यात्रा')}
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t(
              'The steps I have taken, and the ones coming next, from Class 12 Science to building AI.',
              'कक्षा 12 विज्ञान से AI बनाने तक, मेरे अब तक के और आगे के कदम।'
            )}
          </p>
        </motion.header>

        <div ref={trackRef} className="relative">
          {/* Spine */}
          <div
            aria-hidden
            className="absolute bottom-2 left-4 top-2 w-px -translate-x-1/2 lg:left-1/2"
            style={{ background: 'var(--line)' }}
          />
          <motion.div
            aria-hidden
            className="absolute bottom-2 left-4 top-2 w-px origin-top -translate-x-1/2 lg:left-1/2"
            style={{
              scaleY: fill,
              background: 'linear-gradient(to bottom, var(--gold-soft), var(--gold) 60%, var(--gold-deep))',
              boxShadow: '0 0 14px rgba(212,175,95,0.6)',
            }}
          />

          <div className="space-y-12 lg:space-y-16">
            {milestones.map((m, i) => {
              const kind = getKind(m.status);
              const left = i % 2 === 0;
              const label = hi
                ? m.statusTextHi || m.statusText || DEFAULT_LABEL[kind].hi
                : m.statusText || DEFAULT_LABEL[kind].en;
              const title = hi ? m.titleHi || m.title : m.title;
              const desc = hi ? m.descriptionHi || m.description : m.description;

              return (
                <motion.div
                  key={m.id || i}
                  variants={rise}
                  initial="hidden"
                  whileInView="show"
                  viewport={{ once: true, margin: '-60px' }}
                  className="relative grid grid-cols-1 pl-12 lg:grid-cols-[1fr_64px_1fr] lg:pl-0"
                >
                  {/* Node */}
                  <div className="absolute left-4 top-8 z-10 -translate-x-1/2 lg:left-1/2">
                    <Node kind={kind} />
                  </div>

                  {/* Card */}
                  <div
                    onMouseMove={onMove}
                    className={`group relative overflow-hidden rounded-[22px] border p-6 transition-[border-color,box-shadow] duration-300 hover:border-[color:var(--line-strong)] hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_60px_-25px_rgba(212,175,95,0.4)] sm:p-7 ${
                      left ? 'lg:col-start-1' : 'lg:col-start-3'
                    }`}
                    style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
                  >
                    <div
                      aria-hidden
                      className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                      style={{
                        background:
                          'radial-gradient(340px circle at var(--mx, 50%) var(--my, 50%), rgba(212,175,95,0.14), transparent 60%)',
                      }}
                    />

                    <div className="relative">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
                          {m.yearMonth || m.phase}
                        </span>
                        <span
                          className="text-[9px] font-semibold uppercase tracking-[0.22em]"
                          style={{ color: kind === 'future' ? 'var(--muted)' : 'var(--gold-soft)' }}
                        >
                          {label}
                        </span>
                      </div>

                      <h3
                        className="mt-4 text-[26px] font-normal leading-tight transition-colors duration-300 group-hover:text-[color:var(--gold-soft)]"
                        style={{ ...SERIF, color: 'var(--text)' }}
                      >
                        {title}
                      </h3>
                      <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
                        {desc}
                      </p>

                      {m.topics && m.topics.length > 0 && (
                        <ul className="mt-5 flex flex-wrap gap-2 border-t pt-4" style={{ borderColor: 'var(--line)' }}>
                          {m.topics.map((topic, k) => (
                            <li
                              key={k}
                              className="rounded-full border px-3 py-1 text-[10px] font-medium tracking-wide"
                              style={{ borderColor: 'var(--line)', color: 'var(--text)' }}
                            >
                              {topic}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
