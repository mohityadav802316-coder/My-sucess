import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { ProjectItem } from '../../types';

/* Fonts (index.html में एक बार):
   https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap */

/* ============================ DESIGN TOKENS ============================ */
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
  hidden: { opacity: 0, y: 22 },
  show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: EASE } },
};

/* ============================== HELPERS ============================== */
type StatusKind = 'live' | 'active' | 'draft';

const getStatusKind = (status: string): StatusKind => {
  if (status === 'Done' || status === 'Live Showcase') return 'live';
  if (status === 'Active' || status === 'Active Development' || status === 'In Progress') return 'active';
  return 'draft';
};

const DEFAULT_STATUS: Record<StatusKind, { en: string; hi: string }> = {
  live: { en: 'Live', hi: 'पूर्ण' },
  active: { en: 'In progress', hi: 'प्रगति पर' },
  draft: { en: 'Draft', hi: 'प्रारूप' },
};

const StatusPill: React.FC<{ status: string; statusHi?: string; hi: boolean; className?: string }> = ({
  status,
  statusHi,
  hi,
  className = '',
}) => {
  const kind = getStatusKind(status);
  const label = hi ? statusHi || DEFAULT_STATUS[kind].hi : status || DEFAULT_STATUS[kind].en;
  const dot =
    kind === 'live'
      ? 'bg-[color:var(--gold)]'
      : kind === 'active'
      ? 'bg-[color:var(--gold)] animate-pulse'
      : 'border border-[color:var(--gold)]';

  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] backdrop-blur-md ${className}`}
      style={{ borderColor: 'var(--line-strong)', background: 'rgba(0,0,0,0.65)', color: 'var(--gold-soft)' }}
    >
      <i className={`h-1.5 w-1.5 rounded-full ${dot}`} />
      {label}
    </span>
  );
};

const pick = <T,>(hi: boolean, en: T, h?: T) => (hi && h ? h : en);

/* ============================ PROJECT CARD ============================ */
interface CardProps {
  project: ProjectItem;
  index: number;
  hi: boolean;
  onOpen: (p: ProjectItem) => void;
}

const ProjectCard: React.FC<CardProps> = ({ project, index, hi, onOpen }) => {
  const ref = useRef<HTMLDivElement>(null);
  const [imgFailed, setImgFailed] = useState(false);

  // कर्सर के साथ चलने वाली रोशनी + हल्का 3D झुकाव
  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    const y = e.clientY - r.top;
    el.style.setProperty('--mx', `${x}px`);
    el.style.setProperty('--my', `${y}px`);
    el.style.transform = `perspective(1000px) rotateX(${(y / r.height - 0.5) * -5}deg) rotateY(${
      (x / r.width - 0.5) * 5
    }deg) translateY(-4px)`;
  };
  const handleLeave = () => {
    if (ref.current) ref.current.style.transform = '';
  };

  const title = pick(hi, project.title, project.titleHi);
  const desc = pick(hi, project.description, project.descriptionHi);
  const hasImage = Boolean(project.imageUrl?.trim()) && !imgFailed;

  return (
    <motion.div variants={rise} transition={{ delay: (index % 3) * 0.09 }}>
      <div
        ref={ref}
        role="button"
        tabIndex={0}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        onClick={() => onOpen(project)}
        onKeyDown={(e) => e.key === 'Enter' && onOpen(project)}
        className="group relative flex h-full cursor-pointer flex-col overflow-hidden rounded-[22px] border transition-[border-color,box-shadow,transform] duration-300 ease-out hover:shadow-[0_30px_70px_-30px_rgba(0,0,0,0.9),0_0_60px_-25px_rgba(212,175,95,0.45)]"
        style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
        onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'var(--line-strong)')}
        onMouseOut={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget as Node)) e.currentTarget.style.borderColor = 'var(--line)';
        }}
      >
        {/* Spotlight */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-[2] opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          style={{ background: 'radial-gradient(380px circle at var(--mx, 50%) var(--my, 50%), rgba(212,175,95,0.16), transparent 60%)' }}
        />

        {/* Cover */}
        <div
          className="relative aspect-[16/10] overflow-hidden border-b"
          style={{ borderColor: 'var(--line)', background: 'radial-gradient(ellipse at 30% 20%, #2f2514, #0b0907 75%)' }}
        >
          {hasImage ? (
            <img
              src={project.imageUrl}
              alt={title}
              loading="lazy"
              decoding="async"
              onError={() => setImgFailed(true)}
              className="h-full w-full object-cover transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07]"
            />
          ) : (
            <div className="absolute inset-0 transition-transform duration-[1100ms] ease-out group-hover:scale-[1.07]">
              <div
                className="absolute inset-0 opacity-35"
                style={{
                  backgroundImage:
                    'linear-gradient(var(--line) 1px, transparent 1px), linear-gradient(90deg, var(--line) 1px, transparent 1px)',
                  backgroundSize: '34px 34px',
                  maskImage: 'radial-gradient(ellipse at 40% 30%, #000, transparent 75%)',
                  WebkitMaskImage: 'radial-gradient(ellipse at 40% 30%, #000, transparent 75%)',
                }}
              />
              <span
                className="absolute -bottom-3 right-4 text-[120px] font-light leading-none opacity-25"
                style={{ ...SERIF, ...GOLD_TEXT }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
            </div>
          )}

          {/* Sheen */}
          <div
            aria-hidden
            className="pointer-events-none absolute left-[-60%] top-0 z-[1] h-full w-[40%] -skew-x-[18deg] transition-[left] duration-[900ms] ease-out group-hover:left-[130%]"
            style={{ background: 'linear-gradient(100deg, transparent, rgba(241,223,168,0.16), transparent)' }}
          />

          <StatusPill
            status={project.status}
            statusHi={project.statusHi}
            hi={hi}
            className="absolute left-4 top-4 z-[3]"
          />
        </div>

        {/* Body */}
        <div className="relative z-[3] flex flex-1 flex-col p-6">
          <h3
            className="text-[27px] font-normal leading-tight transition-colors duration-300 group-hover:text-[color:var(--gold-soft)]"
            style={{ ...SERIF, color: 'var(--text)' }}
          >
            {title}
          </h3>
          <p className="mt-2 line-clamp-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
            {desc}
          </p>

          <div className="mt-auto flex items-center justify-between pt-6">
            <div className="flex gap-5">
              {project.liveUrl && <TextLink href={project.liveUrl}>{hi ? 'लाइव' : 'Live'}</TextLink>}
              {project.githubUrl && <TextLink href={project.githubUrl}>GitHub</TextLink>}
            </div>
            <span
              className="flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em]"
              style={{ color: 'var(--gold)' }}
            >
              {hi ? 'विवरण' : 'Details'}
              <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-1" strokeWidth={1.6} />
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const TextLink: React.FC<{ href: string; children: React.ReactNode }> = ({ href, children }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={(e) => {
      e.stopPropagation();
      sound.playClick();
    }}
    className="border-b pb-[3px] text-[10px] font-semibold uppercase tracking-[0.22em] transition-colors hover:text-[color:var(--gold-soft)]"
    style={{ color: 'var(--text)', borderColor: 'var(--line-strong)' }}
  >
    {children}
  </a>
);

/* ================================ MAIN ================================ */
export const ProjectsSection: React.FC = () => {
  const { mode } = useLanguage();
  const { projects } = useImages();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);
  const [selected, setSelected] = useState<ProjectItem | null>(null);

  const closeModal = useCallback(() => {
    sound.playClick();
    setSelected(null);
  }, []);

  const openModal = useCallback((p: ProjectItem) => {
    sound.playClick();
    setSelected(p);
  }, []);

  // Escape + background scroll lock
  useEffect(() => {
    if (!selected) return;
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && closeModal();
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [selected, closeModal]);

  const features = selected ? (hi && selected.featuresHi?.length ? selected.featuresHi : selected.features) || [] : [];

  return (
    <section
      id="projects"
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
          className="mb-14 max-w-2xl sm:mb-16"
        >
          <span className="block text-[10px] font-semibold uppercase tracking-[0.3em]" style={{ color: 'var(--gold)' }}>
            {t('Projects', 'प्रोजेक्ट')}
          </span>
          <h2 className="mt-4 text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl" style={{ ...SERIF, ...GOLD_TEXT }}>
            {t('Selected Work', 'चुने हुए काम')}
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t(
              'Software, Python tools and web products I have built and shipped.',
              'सॉफ़्टवेयर, पायथन टूल और वेब प्रोजेक्ट, जो मैंने बनाए और लोगों तक पहुँचाए।'
            )}
          </p>
        </motion.header>

        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          transition={{ staggerChildren: 0.05 }}
          className="grid grid-cols-1 gap-7 md:grid-cols-2 lg:grid-cols-3"
        >
          {projects.map((project, i) => (
            <ProjectCard key={project.id || i} project={project} index={i} hi={hi} onOpen={openModal} />
          ))}
        </motion.div>
      </div>

      {/* ============ MODAL ============ */}
      <AnimatePresence>
        {selected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={closeModal}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-5 backdrop-blur-md"
            style={TOKENS}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              initial={{ opacity: 0, y: 24, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 24, scale: 0.97 }}
              transition={{ duration: 0.45, ease: EASE }}
              onClick={(e) => e.stopPropagation()}
              className="relative max-h-[90vh] w-full max-w-[620px] overflow-y-auto rounded-[26px] border p-8 sm:p-10 text-left"
              style={{
                borderColor: 'var(--line-strong)',
                background: 'linear-gradient(180deg, #110f0b, #080706)',
                boxShadow: '0 50px 120px -30px #000, 0 0 80px -30px rgba(212,175,95,0.4)',
              }}
            >
              <button
                type="button"
                onClick={closeModal}
                aria-label="Close"
                className="absolute right-5 top-5 flex h-9 w-9 items-center justify-center rounded-full border bg-black/60 transition-colors hover:text-[color:var(--gold-soft)] cursor-pointer"
                style={{ borderColor: 'var(--line-strong)', color: 'var(--gold)' }}
              >
                <X className="h-4 w-4" strokeWidth={1.5} />
              </button>

              <StatusPill status={selected.status} statusHi={selected.statusHi} hi={hi} />

              <h3 className="mt-4 pr-10 text-4xl font-light leading-[1.1]" style={{ ...SERIF, ...GOLD_TEXT }}>
                {pick(hi, selected.title, selected.titleHi)}
              </h3>
              {(selected.subtitle || selected.subtitleHi) && (
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
                  {pick(hi, selected.subtitle, selected.subtitleHi)}
                </p>
              )}

              {selected.imageUrl?.trim() && (
                <div className="mt-6 aspect-video overflow-hidden rounded-2xl border" style={{ borderColor: 'var(--line)' }}>
                  <img src={selected.imageUrl} alt={selected.title} decoding="async" className="h-full w-full object-cover" />
                </div>
              )}

              <p className="mt-6 text-[15px] leading-[1.75]" style={{ color: 'var(--muted)' }}>
                {pick(hi, selected.description, selected.descriptionHi)}
              </p>

              {features.length > 0 && (
                <ul className="mt-6 border-t" style={{ borderColor: 'var(--line)' }}>
                  {features.map((f, i) => (
                    <li key={i} className="flex items-baseline gap-4 border-b py-3.5 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--text)' }}>
                      <span className="text-[17px] font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              )}

              {(selected.liveUrl || selected.githubUrl) && (
                <div className="mt-7 flex flex-wrap gap-3">
                  {selected.liveUrl && (
                    <a
                      href={selected.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className="inline-flex rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14100A] transition-all hover:brightness-110 active:scale-95 shadow-[0_8px_28px_rgba(212,175,95,0.28)]"
                      style={{ background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))' }}
                    >
                      {t('Open Live', 'लाइव देखें')}
                    </a>
                  )}
                  {selected.githubUrl && (
                    <a
                      href={selected.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playClick()}
                      className="inline-flex rounded-full border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors hover:text-[color:var(--gold-soft)] active:scale-95"
                      style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
                    >
                      GitHub
                    </a>
                  )}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
