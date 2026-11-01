import React, { useMemo } from 'react';
import { motion, type Variants } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';

/* ------------------------------------------------------------------ *
 *  Fonts (index.html में एक बार, अगर पहले से नहीं जोड़े):
 *  https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap
 * ------------------------------------------------------------------ */

const TOKENS = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--panel': 'rgba(14,12,9,0.72)',
  '--line': 'rgba(212,175,95,0.22)',
  '--line-strong': 'rgba(212,175,95,0.55)',
} as React.CSSProperties;

const SERIF: React.CSSProperties = {
  fontFamily: '"Cormorant Garamond", Georgia, serif',
};
const GOLD_TEXT: React.CSSProperties = {
  backgroundImage:
    'linear-gradient(120deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const EASE = [0.22, 1, 0.36, 1] as const;
const group: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09 } },
};
const rise: Variants = {
  hidden: { opacity: 0, y: 18 },
  show: { opacity: 1, y: 0, transition: { duration: 0.75, ease: EASE } },
};

const Label: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <span
    className="block text-[10px] font-semibold uppercase tracking-[0.3em]"
    style={{ color: 'var(--gold)', fontFamily: 'Inter, system-ui, sans-serif' }}
  >
    {children}
  </span>
);

const Fact: React.FC<{ label: string; title: string; text: string }> = ({ label, title, text }) => (
  <div className="py-6 first:pt-0 border-b last:border-b-0" style={{ borderColor: 'var(--line)' }}>
    <Label>{label}</Label>
    <h3 className="mt-2 text-2xl sm:text-[26px] font-normal leading-snug" style={{ ...SERIF, color: 'var(--text)' }}>
      {title}
    </h3>
    <p className="mt-2 text-sm leading-relaxed" style={{ color: 'var(--muted)' }}>
      {text}
    </p>
  </div>
);

export const AboutSection: React.FC = () => {
  const { mode } = useLanguage();
  const { mainProfileImage, siteSettings } = useImages();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  const photo = useMemo(() => {
    const remote = mainProfileImage?.downloadUrl?.trim();
    if (remote) return remote;
    if (typeof window === 'undefined') return '';
    try {
      return localStorage.getItem('mohit_profile_photo')?.trim() || '';
    } catch {
      return '';
    }
  }, [mainProfileImage?.downloadUrl]);

  const skills = [
    t('AI Engineering', 'AI इंजीनियरिंग'),
    t('Python & Automation', 'पायथन व ऑटोमेशन'),
    t('Web & Mobile Apps', 'वेब व मोबाइल ऐप्स'),
    t('Machine Learning', 'मशीन लर्निंग'),
    t('3D & WebGL', '3D व WebGL'),
    t('Cyber Security', 'साइबर सुरक्षा'),
  ];

  const showHobby = siteSettings.profile?.showHobby !== false;
  const hobby = hi
    ? siteSettings.profile?.hobbyHi || 'AI डेवलपमेंट और 3D डिज़ाइन'
    : siteSettings.profile?.hobbyEn || 'AI development & 3D design';

  return (
    <section
      id="about"
      style={TOKENS}
      className="relative overflow-hidden px-5 sm:px-8 lg:px-10 py-24 sm:py-28"
    >
      {/* सूक्ष्म gold रोशनी — सिर्फ़ एक */}
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[380px] w-[720px] -translate-x-1/2 opacity-[0.14] blur-[130px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <motion.div
        variants={group}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: '-60px' }}
        className="relative mx-auto max-w-6xl"
      >
        {/* ---------- Heading ---------- */}
        <motion.header variants={rise} className="mb-14 sm:mb-16 max-w-2xl">
          <Label>{t('About', 'परिचय')}</Label>
          <h2
            className="mt-4 text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05]"
            style={{ ...SERIF, ...GOLD_TEXT }}
          >
            {t('Building things that matter', 'ऐसा बनाना जो काम आए')}
          </h2>
          <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
            {t(
              'Class 12 Science student who writes code every day and builds real AI tools.',
              'कक्षा 12 विज्ञान का छात्र, जो हर दिन कोड लिखता है और असली AI टूल बनाता है।'
            )}
          </p>
        </motion.header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center">
          {/* ---------- Portrait ---------- */}
          <motion.div variants={rise} className="lg:col-span-5 flex flex-col items-center">
            <div className="relative h-[400px] w-[290px] sm:h-[440px] sm:w-[320px]">
              <div
                aria-hidden
                className="absolute -inset-3 rounded-t-[160px] rounded-b-[26px] border"
                style={{ borderColor: 'var(--line)' }}
              />
              <div
                className="relative h-full w-full overflow-hidden rounded-t-[150px] rounded-b-[18px] border"
                style={{
                  borderColor: 'var(--line-strong)',
                  background: 'radial-gradient(ellipse at 50% 25%, #2b2314 0%, #0b0907 75%)',
                  boxShadow: '0 40px 90px -30px rgba(0,0,0,0.95), 0 0 60px -20px rgba(212,175,95,0.25)',
                }}
              >
                {photo ? (
                  <img
                    src={photo}
                    alt="Mohit Yadav"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="text-[110px] font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
                      M
                    </span>
                  </div>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
              </div>
            </div>

            <div className="mt-9 text-center">
              <p className="text-3xl font-normal" style={{ ...SERIF, color: 'var(--text)' }}>
                Mohit Yadav
              </p>
              <p
                className="mt-1.5 text-[10px] font-medium uppercase tracking-[0.3em]"
                style={{ color: 'var(--gold)' }}
              >
                {t('Class 12 · Science', 'कक्षा 12 · विज्ञान')}
              </p>
            </div>
          </motion.div>

          {/* ---------- Content ---------- */}
          <motion.div variants={rise} className="lg:col-span-7">
            <div
              className="rounded-3xl border p-7 sm:p-10 backdrop-blur-sm"
              style={{ background: 'var(--panel)', borderColor: 'var(--line)' }}
            >
              <Fact
                label={t('Education', 'शिक्षा')}
                title={t('Class 12 Science, Bihar Board', 'कक्षा 12 विज्ञान, बिहार बोर्ड')}
                text={t(
                  'Strong base in Physics, Chemistry and Maths, with Python practice every day.',
                  'भौतिकी, रसायन और गणित की मज़बूत नींव, और रोज़ पायथन का अभ्यास।'
                )}
              />
              <Fact
                label={t('Goal', 'लक्ष्य')}
                title={t('Applied AI Engineer', 'एप्लाइड AI इंजीनियर')}
                text={t(
                  'To build AI agents and software that people can actually use.',
                  'ऐसे AI एजेंट और सॉफ़्टवेयर बनाना जिन्हें लोग सच में इस्तेमाल करें।'
                )}
              />
              {showHobby && (
                <Fact label={t('Hobby', 'शौक़')} title={hobby} text="" />
              )}
            </div>

            {/* ---------- Skills ---------- */}
            <div className="mt-12">
              <Label>{t('What I work with', 'मेरा काम')}</Label>
              <ul className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-10">
                {skills.map((s, i) => (
                  <li
                    key={s}
                    className="group flex items-baseline gap-4 border-b py-4 transition-colors"
                    style={{ borderColor: 'var(--line)' }}
                  >
                    <span className="text-lg font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className="text-sm sm:text-[15px] transition-colors group-hover:text-[color:var(--gold-soft)]"
                      style={{ color: 'var(--text)' }}
                    >
                      {s}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </section>
  );
};
