import React, { useState, useMemo } from 'react';
import { motion, type Variants } from 'motion/react';
import { Search, Copy, Check, ExternalLink, ArrowRight } from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { UNIVERSAL_TECH_REGISTRY, UNIVERSAL_TECH_CATEGORIES } from '../../data/universalTechRegistry';
import { PremiumBrandLogo } from '../vfx/PremiumBrandLogo';

/* Fonts (index.html में एक बार):
   https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400;500&family=Inter:wght@400;500;600&display=swap */

const TOKENS = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--panel': '#0C0B09',
  '--panel-2': '#100E0B',
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

const Label: React.FC<{ children: React.ReactNode; muted?: boolean }> = ({ children, muted }) => (
  <span
    className="block text-[9px] font-semibold uppercase tracking-[0.3em]"
    style={{ color: muted ? 'var(--muted)' : 'var(--gold)' }}
  >
    {children}
  </span>
);

export const UniversalTechConsole: React.FC = () => {
  const { mode } = useLanguage();
  const hi = mode === 'hi';
  const t = (en: string, h: string) => (hi ? h : en);

  const [category, setCategory] = useState('all');
  const [query, setQuery] = useState('');
  const [selectedId, setSelectedId] = useState('python');
  const [copied, setCopied] = useState(false);

  const selected = useMemo(
    () => UNIVERSAL_TECH_REGISTRY.find((i) => i.id === selectedId) || UNIVERSAL_TECH_REGISTRY[0],
    [selectedId]
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return UNIVERSAL_TECH_REGISTRY.filter((tech) => {
      if (category !== 'all' && tech.category !== category) return false;
      if (!q) return true;
      return (
        tech.name.toLowerCase().includes(q) ||
        tech.nameHi?.toLowerCase().includes(q) ||
        tech.categoryLabel.toLowerCase().includes(q) ||
        tech.features.some((f) => f.toLowerCase().includes(q)) ||
        tech.compatibility.platforms.some((p) => p.toLowerCase().includes(q))
      );
    });
  }, [category, query]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: UNIVERSAL_TECH_REGISTRY.length };
    UNIVERSAL_TECH_REGISTRY.forEach((i) => (map[i.category] = (map[i.category] || 0) + 1));
    return map;
  }, []);

  const handleCopy = async () => {
    if (!selected.sampleCodeSnippet) return;
    sound.playClick();
    try {
      await navigator.clipboard.writeText(selected.sampleCodeSnippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked */
    }
  };

  const features = (hi && selected.featuresHi?.length ? selected.featuresHi : selected.features) || [];
  const name = hi && selected.nameHi ? selected.nameHi : selected.name;

  return (
    <section
      id="tech-console"
      style={TOKENS}
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-28 lg:px-10 select-none"
    >
      <div
        aria-hidden
        className="pointer-events-none absolute -top-32 left-1/2 h-[420px] w-[800px] -translate-x-1/2 opacity-[0.14] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-7xl">
        {/* ---------- Header ---------- */}
        <motion.header
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          className="mb-12 flex flex-col justify-between gap-6 md:flex-row md:items-end"
        >
          <div className="max-w-2xl">
            <Label>{t('Technology', 'तकनीक')}</Label>
            <h2 className="mt-4 text-4xl font-light leading-[1.05] sm:text-5xl lg:text-6xl" style={{ ...SERIF, ...GOLD_TEXT }}>
              {t('Tech Console', 'टेक कंसोल')}
            </h2>
            <p className="mt-5 text-base leading-relaxed" style={{ color: 'var(--muted)' }}>
              {t(
                'Languages, frameworks, databases and AI tools I work with. Pick one to explore.',
                'भाषाएँ, फ़्रेमवर्क, डेटाबेस और AI टूल जिनके साथ मैं काम करता हूँ। कोई एक चुनकर देखें।'
              )}
            </p>
          </div>
          <div className="text-right">
            <span className="text-5xl font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
              {UNIVERSAL_TECH_REGISTRY.length}
            </span>
            <Label muted>{t('Technologies', 'तकनीकें')}</Label>
          </div>
        </motion.header>

        {/* ---------- Console ---------- */}
        <motion.div
          variants={rise}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-40px' }}
          className="overflow-hidden rounded-[28px] border"
          style={{
            borderColor: 'var(--line-strong)',
            background: 'var(--panel)',
            boxShadow: '0 40px 100px -40px #000, 0 0 80px -40px rgba(212,175,95,0.35)',
          }}
        >
          {/* Search + tabs */}
          <div className="flex flex-col gap-4 border-b px-5 py-4 sm:px-7" style={{ borderColor: 'var(--line)' }}>
            <div className="relative w-full max-w-md">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2" style={{ color: 'var(--gold)' }} strokeWidth={1.5} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder={t('Search technology', 'तकनीक खोजें')}
                className="w-full rounded-full border bg-black/50 py-2.5 pl-11 pr-16 text-sm outline-none transition-colors placeholder:text-[color:var(--muted)] focus:border-[color:var(--gold)]"
                style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[9px] font-semibold uppercase tracking-[0.2em] cursor-pointer hover:text-[color:var(--gold-soft)]"
                  style={{ color: 'var(--gold)' }}
                >
                  {t('Clear', 'हटाएँ')}
                </button>
              )}
            </div>

            <div className="no-scrollbar -mx-1 flex gap-1 overflow-x-auto px-1">
              {UNIVERSAL_TECH_CATEGORIES.map((cat) => {
                const active = category === cat.id;
                return (
                  <button
                    key={cat.id}
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setCategory(cat.id);
                    }}
                    className="whitespace-nowrap rounded-full px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.2em] transition-all cursor-pointer"
                    style={
                      active
                        ? { background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))', color: '#14100A' }
                        : { color: 'var(--muted)' }
                    }
                  >
                    {hi ? cat.labelHi : cat.labelEn}
                    <span className="ml-2 opacity-60">{counts[cat.id] ?? 0}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Stage */}
          <div className="grid grid-cols-1 lg:grid-cols-12">
            {/* Lens */}
            <div
              className="relative flex flex-col items-center justify-center overflow-hidden border-b p-8 lg:col-span-5 lg:border-b-0 lg:border-r"
              style={{ borderColor: 'var(--line)', background: 'radial-gradient(ellipse at 50% 35%, #1a150c 0%, #0a0907 75%)' }}
            >
              <div aria-hidden className="pointer-events-none absolute inset-0 flex items-center justify-center">
                <div className="h-[320px] w-[320px] rounded-full border" style={{ borderColor: 'var(--line)' }} />
                <div className="absolute h-[390px] w-[390px] rounded-full border border-dashed opacity-60" style={{ borderColor: 'var(--line)' }} />
              </div>

              <div className="relative my-4 flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
                <div className="absolute inset-0 z-0 flex items-center justify-center pointer-events-none">
                  <div
                    className="absolute h-48 w-48 rounded-full opacity-35 blur-2xl transition-all duration-700"
                    style={{ background: selected.accentGlow || 'rgba(212,175,95,0.4)' }}
                  />
                  <div
                    className="absolute h-44 w-44 rounded-full border border-dashed opacity-40 animate-[spin_24s_linear_infinite]"
                    style={{ borderColor: selected.svgBrandColor || 'var(--gold)' }}
                  />
                  <div
                    className="absolute h-56 w-56 rounded-full border opacity-20"
                    style={{ borderColor: selected.svgBrandColor || 'var(--gold)' }}
                  />
                </div>
                <motion.div
                  key={selected.id}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.6, ease: EASE }}
                  className="relative z-10 flex h-28 w-28 items-center justify-center drop-shadow-[0_14px_30px_rgba(0,0,0,0.6)] sm:h-32 sm:w-32"
                >
                  <PremiumBrandLogo
                    iconName={selected.iconName}
                    className="h-full w-full object-contain"
                    brandColor={selected.svgBrandColor}
                  />
                </motion.div>
                {selected.badge && (
                  <span
                    className="absolute -bottom-1 z-20 rounded-full px-3.5 py-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-[#14100A]"
                    style={{ background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))' }}
                  >
                    {selected.badge}
                  </span>
                )}
              </div>

              <div className="relative z-10 mt-4 text-center">
                <h3 className="text-4xl font-light" style={{ ...SERIF, color: 'var(--text)' }}>
                  {name}
                </h3>
                <p className="mt-2 text-[10px] font-semibold uppercase tracking-[0.28em]" style={{ color: 'var(--gold)' }}>
                  {hi ? selected.categoryLabelHi || selected.categoryLabel : selected.categoryLabel}
                  {selected.versionOrLevel ? `  ·  ${selected.versionOrLevel}` : ''}
                </p>
              </div>

              <div className="relative z-10 mt-7 w-full max-w-xs">
                <div className="flex items-baseline justify-between">
                  <Label muted>{t('Proficiency', 'दक्षता')}</Label>
                  <span className="text-2xl font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
                    {selected.proficiency}%
                  </span>
                </div>
                <div className="mt-2.5 h-[3px] w-full overflow-hidden rounded-full" style={{ background: 'var(--line)' }}>
                  <motion.div
                    key={`gauge-${selected.id}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${selected.proficiency}%` }}
                    transition={{ duration: 0.9, ease: EASE }}
                    className="h-full rounded-full"
                    style={{
                      background: 'linear-gradient(90deg, var(--gold-deep), var(--gold-soft))',
                      boxShadow: '0 0 12px rgba(212,175,95,0.6)',
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Details */}
            <div className="space-y-7 p-6 sm:p-9 lg:col-span-7" style={{ background: 'var(--panel-2)' }}>
              <div>
                <Label>{t('Overview', 'परिचय')}</Label>
                <p className="mt-3 text-[15px] leading-[1.75]" style={{ color: 'var(--muted)' }}>
                  {hi && selected.shortSummaryHi ? selected.shortSummaryHi : selected.shortSummary}
                </p>
              </div>

              <dl className="grid grid-cols-1 gap-px overflow-hidden rounded-2xl border sm:grid-cols-3" style={{ borderColor: 'var(--line)', background: 'var(--line)' }}>
                {[
                  [t('Platforms', 'प्लेटफ़ॉर्म'), selected.compatibility.platforms.join(', ')],
                  [t('Architecture', 'आर्किटेक्चर'), selected.compatibility.architecture],
                  [t('Runtime', 'रनटाइम'), selected.compatibility.runtime],
                ].map(([k, v]) => (
                  <div key={k} className="p-4" style={{ background: 'var(--panel-2)' }}>
                    <dt><Label muted>{k}</Label></dt>
                    <dd className="mt-1.5 text-sm" style={{ color: 'var(--text)' }}>{v}</dd>
                  </div>
                ))}
              </dl>

              {features.length > 0 && (
                <div>
                  <Label>{t('Key features', 'मुख्य विशेषताएँ')}</Label>
                  <ul className="mt-3 grid grid-cols-1 gap-x-8 sm:grid-cols-2">
                    {features.map((f, i) => (
                      <li key={i} className="flex items-baseline gap-3.5 border-b py-3 text-sm" style={{ borderColor: 'var(--line)', color: 'var(--text)' }}>
                        <span className="text-base font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selected.sampleCodeSnippet && (
                <div>
                  <div className="flex items-center justify-between">
                    <Label>{t('Code sample', 'कोड नमूना')}</Label>
                    <button
                      type="button"
                      onClick={handleCopy}
                      className="flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.22em] transition-colors cursor-pointer hover:text-[color:var(--gold-soft)]"
                      style={{ color: copied ? 'var(--gold-soft)' : 'var(--muted)' }}
                    >
                      {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" strokeWidth={1.5} />}
                      {copied ? t('Copied', 'कॉपी हुआ') : t('Copy', 'कॉपी')}
                    </button>
                  </div>
                  <pre
                    className="mt-3 select-text overflow-x-auto rounded-2xl border bg-black/60 p-4 font-mono text-[11px] leading-relaxed"
                    style={{ borderColor: 'var(--line)', color: 'var(--gold-soft)' }}
                  >
                    <code>{selected.sampleCodeSnippet}</code>
                  </pre>
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                {selected.documentationUrl && (
                  <a
                    href={selected.documentationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => sound.playClick()}
                    className="inline-flex items-center gap-2 rounded-full px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#14100A] transition-all hover:brightness-110 active:scale-95 shadow-[0_8px_28px_rgba(212,175,95,0.28)]"
                    style={{ background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))' }}
                  >
                    {t('Documentation', 'दस्तावेज़')}
                    <ExternalLink className="h-3.5 w-3.5" strokeWidth={2} />
                  </a>
                )}
                <button
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    document.getElementById('projects')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  className="inline-flex items-center gap-2 rounded-full border px-6 py-3 text-[11px] font-semibold uppercase tracking-[0.2em] transition-colors cursor-pointer hover:text-[color:var(--gold-soft)] active:scale-95"
                  style={{ borderColor: 'var(--line-strong)', color: 'var(--text)' }}
                >
                  {t('See in projects', 'प्रोजेक्ट में देखें')}
                  <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.6} />
                </button>
              </div>
            </div>
          </div>

          {/* Catalogue */}
          <div className="border-t px-5 py-5 sm:px-7" style={{ borderColor: 'var(--line)', background: '#0A0908' }}>
            <div className="mb-3 flex items-center justify-between">
              <Label muted>
                {t('All technologies', 'सभी तकनीकें')} · {list.length}
              </Label>
              <span className="hidden text-[9px] uppercase tracking-[0.22em] sm:inline" style={{ color: 'var(--muted)' }}>
                {t('Tap one to view', 'देखने के लिए चुनें')}
              </span>
            </div>

            {list.length === 0 ? (
              <p className="py-6 text-center text-sm" style={{ color: 'var(--muted)' }}>
                {t('Nothing found. Try another word.', 'कुछ नहीं मिला। कोई और शब्द आज़माएँ।')}
              </p>
            ) : (
              <div className="no-scrollbar flex gap-3 overflow-x-auto pb-1 scroll-smooth">
                {list.map((item) => {
                  const active = item.id === selectedId;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        setSelectedId(item.id);
                      }}
                      className="flex shrink-0 items-center gap-3 rounded-2xl border py-2.5 pl-2.5 pr-5 transition-all duration-300 cursor-pointer hover:border-[color:var(--line-strong)]"
                      style={{
                        borderColor: active ? 'var(--gold)' : 'var(--line)',
                        background: active ? 'rgba(212,175,95,0.08)' : 'var(--panel)',
                        boxShadow: active ? '0 0 30px -10px rgba(212,175,95,0.5)' : 'none',
                      }}
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border bg-black/50 p-1.5" style={{ borderColor: 'var(--line)' }}>
                        <PremiumBrandLogo iconName={item.iconName} className="h-full w-full object-contain" brandColor={item.svgBrandColor} />
                      </span>
                      <span className="text-left">
                        <span className="block whitespace-nowrap text-sm" style={{ color: active ? 'var(--gold-soft)' : 'var(--text)' }}>
                          {hi && item.nameHi ? item.nameHi : item.name}
                        </span>
                        <span className="block text-[9px] uppercase tracking-[0.2em]" style={{ color: 'var(--muted)' }}>
                          {item.categoryLabel}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </section>
  );
};
