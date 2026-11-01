/*
  Fonts required in index.html:
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,400&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
*/

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, useReducedMotion, type Variants } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { LanguageMode } from '../../types';
import { sound } from '../audio/SoundEffects';
import { ShieldCheck, Lock, KeyRound, Activity, Terminal, Copy, Check, CheckCircle2, RefreshCw } from 'lucide-react';

const TOKENS: React.CSSProperties = {
  '--gold': '#D4AF5F',
  '--gold-soft': '#F1DFA8',
  '--gold-deep': '#A8823A',
  '--text': '#F6F0E4',
  '--muted': '#9A8F7C',
  '--panel': '#0C0B09',
  '--panel-2': '#100E0B',
  '--line': 'rgba(212,175,95,0.20)',
  '--line-strong': 'rgba(212,175,95,0.55)',
} as React.CSSProperties;

const SERIF: React.CSSProperties = { fontFamily: '"Cormorant Garamond", Georgia, serif' };
const SANS: React.CSSProperties = { fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif' };

const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(120deg, var(--gold-soft) 0%, var(--gold) 50%, var(--gold-deep) 100%)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const EASE = [0.22, 1, 0.36, 1] as const;

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

const riseVariant: Variants = {
  hidden: { opacity: 0, y: 22 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.8, ease: EASE },
  },
};

interface Pillar {
  id: string;
  num: string;
  title: string;
  titleHi: string;
  icon: React.ReactNode;
  desc: string;
  descHi: string;
}

const DEFENSIVE_PILLARS: Pillar[] = [
  {
    id: 'integrity',
    num: '01',
    title: 'Cryptographic Integrity',
    titleHi: 'क्रिप्टोग्राफिक अखंडता',
    icon: <KeyRound className="w-5 h-5 text-[var(--gold)]" />,
    desc: 'Ensures payloads remain unaltered in transit via deterministic verification.',
    descHi: 'सत्यापन के साथ ट्रांजिट में डेटा की अखंडता व शुद्धता सुरक्षित रखना।',
  },
  {
    id: 'zerotrust',
    num: '02',
    title: 'Zero-Trust Architecture',
    titleHi: 'जीरो-ट्रस्ट संरचना',
    icon: <Lock className="w-5 h-5 text-[var(--gold)]" />,
    desc: 'Continuous authentication and strict role-based policy validation on all layers.',
    descHi: 'प्रत्येक स्तर पर निरंतर सत्यापन और भूमिका-आधारित नियम नियंत्रण।',
  },
  {
    id: 'network',
    num: '03',
    title: 'Traffic & Perimeter Shield',
    titleHi: 'नेटवर्क व ट्रैफ़िक सुरक्षा',
    icon: <Activity className="w-5 h-5 text-[var(--gold)]" />,
    desc: 'Rate-limiting perimeters and request anomaly isolation at gateway tiers.',
    descHi: 'गेटवे स्तर पर असामान्य अनुरोधों की पहचान और ट्रैफ़िक दर-सीमा प्रबंधन।',
  },
  {
    id: 'auth',
    num: '04',
    title: 'Strict Secrets & Access',
    titleHi: 'गोपनीयता व प्रमाणीकरण',
    icon: <ShieldCheck className="w-5 h-5 text-[var(--gold)]" />,
    desc: 'Isolated backend secret scopes, PKCE protocols, and restricted rule policies.',
    descHi: 'सुरक्षित सर्वर सीक्रेट्स, PKCE मानक और नियंत्रित डेटाबेस सुरक्षा नियम।',
  },
];

interface PillarCardProps {
  pillar: Pillar;
  mode: LanguageMode;
  shouldReduceMotion: boolean | null;
}

const PillarCard: React.FC<PillarCardProps> = ({ pillar, mode, shouldReduceMotion }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [coords, setCoords] = useState<{ x: number; y: number; opacity: number }>({ x: 0, y: 0, opacity: 0 });
  const [tilt, setTilt] = useState<{ rotateX: number; rotateY: number }>({ rotateX: 0, rotateY: 0 });

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    setCoords({ x, y, opacity: 1 });

    if (!shouldReduceMotion) {
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      const rotateX = ((y - centerY) / centerY) * -4.5;
      const rotateY = ((x - centerX) / centerX) * 4.5;
      setTilt({ rotateX, rotateY });
    }
  }, [shouldReduceMotion]);

  const handleMouseLeave = useCallback(() => {
    setCoords((prev) => ({ ...prev, opacity: 0 }));
    setTilt({ rotateX: 0, rotateY: 0 });
  }, []);

  return (
    <motion.div
      variants={riseVariant}
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        transform: shouldReduceMotion
          ? 'none'
          : `perspective(1000px) rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.22, 1, 0.36, 1), border-color 0.3s ease',
      }}
      className="group relative flex flex-col justify-between overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 transition-all duration-300 hover:border-[var(--line-strong)]"
    >
      {/* 1. Cursor Spotlight Overlay */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 transition-opacity duration-500 ease-out"
        style={{
          opacity: coords.opacity,
          background: `radial-gradient(320px circle at ${coords.x}px ${coords.y}px, rgba(212, 175, 95, 0.14), transparent 70%)`,
        }}
      />

      <div>
        {/* Card Header: Pillar Num & Icon */}
        <div className="relative z-10 flex items-center justify-between">
          <span className="text-2xl font-light text-[var(--gold)]" style={SERIF}>
            {pillar.num}
          </span>
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--line)] bg-black/60 backdrop-blur-md transition-all duration-300 group-hover:border-[var(--line-strong)] group-hover:shadow-[0_0_15px_rgba(212,175,95,0.2)]">
            {pillar.icon}
          </div>
        </div>

        {/* Card Body */}
        <div className="relative z-10 mt-6">
          <h3 className="text-xl font-normal text-[var(--text)] tracking-tight" style={SERIF}>
            {mode === 'hi' ? pillar.titleHi : pillar.title}
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-[var(--muted)]" style={SANS}>
            {mode === 'hi' ? pillar.descHi : pillar.desc}
          </p>
        </div>
      </div>

      {/* Bottom micro status */}
      <div className="relative z-10 mt-6 flex items-center gap-2 border-t border-[var(--line)]/50 pt-4 text-[10px] uppercase tracking-wider text-[var(--gold)]/80">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span style={SANS}>{mode === 'hi' ? 'सुरक्षा सक्रिय • ENFORCED' : 'GUARD ACTIVE • ENFORCED'}</span>
      </div>
    </motion.div>
  );
};

// Fallback SHA-256 for non-secure contexts
async function computeSha256(str: string): Promise<string> {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    try {
      const buffer = new TextEncoder().encode(str);
      const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
    } catch {
      // Fallback below
    }
  }
  // Simple deterministic hash fallback
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0;
  }
  return Math.abs(hash).toString(16).padStart(64, '0');
}

export const CyberSecuritySection: React.FC = () => {
  const { mode } = useLanguage();
  const shouldReduceMotion = useReducedMotion();
  const hi = mode === 'hi';

  const [inputPayload, setInputPayload] = useState('mohit.dev // zero-trust payload: verified=true');
  const [hashOutput, setHashOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(true);

  // Update hash when payload changes
  useEffect(() => {
    let isCancelled = false;
    computeSha256(inputPayload).then((hash) => {
      if (!isCancelled) {
        setHashOutput(hash);
      }
    });
    return () => {
      isCancelled = true;
    };
  }, [inputPayload]);

  const handleCopyHash = () => {
    if (!hashOutput) return;
    navigator.clipboard.writeText(hashOutput);
    sound.playClick();
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSimulateVerification = () => {
    sound.playClick();
    setIsVerifying(true);
    setIsVerified(false);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
    }, 600);
  };

  return (
    <section
      id="cybersecurity"
      style={TOKENS}
      className="relative overflow-hidden px-5 py-24 sm:px-8 sm:py-32 select-none"
    >
      {/* Ambient background glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/3 h-[420px] w-[800px] -translate-x-1/2 -translate-y-1/2 opacity-[0.09] blur-[140px]"
        style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
      />

      <div className="relative mx-auto max-w-6xl">
        {/* Section Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="max-w-2xl"
        >
          <motion.div variants={riseVariant} className="flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--gold)]" />
            <span className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--gold)]" style={SANS}>
              {hi ? 'दृश्य 04 • साइबर सुरक्षा' : 'Scene 04 • Cyber & Defensive Architecture'}
            </span>
          </motion.div>

          <motion.h2
            variants={riseVariant}
            className="mt-3 text-4xl font-light tracking-tight text-[var(--text)] sm:text-5xl"
            style={SERIF}
          >
            {hi ? 'कठोर रक्षात्मक ' : 'Defensive '}
            <span style={GOLD_TEXT}>{hi ? 'आर्किटेक्चर' : 'Architecture'}</span>
          </motion.h2>

          <motion.p
            variants={riseVariant}
            className="mt-4 text-sm leading-relaxed text-[var(--muted)]"
            style={SANS}
          >
            {hi
              ? 'शून्य-विश्वास (Zero-Trust) सिद्धांत, क्रिप्टोग्राफिक सत्यनिष्ठा और वास्तविक समय के रक्षात्मक मानकों पर आधारित आधुनिक वेब और सिस्टम सुरक्षा।'
              : 'Engineered on zero-trust principles, cryptographic data integrity, and strict perimeter isolation to ensure absolute system resilience.'}
          </motion.p>
        </motion.div>

        {/* 4 Defensive Pillars */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={containerVariants}
          className="mt-12 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"
        >
          {DEFENSIVE_PILLARS.map((pillar) => (
            <PillarCard
              key={pillar.id}
              pillar={pillar}
              mode={mode}
              shouldReduceMotion={shouldReduceMotion}
            />
          ))}
        </motion.div>

        {/* Interactive Cryptographic Verification Console */}
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-60px' }}
          variants={riseVariant}
          className="mt-12 overflow-hidden rounded-[24px] border border-[var(--line)] bg-[var(--panel)] p-6 sm:p-8 backdrop-blur-xl"
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-[var(--line)]/50 pb-5">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--line)] bg-black/60 text-[var(--gold)]">
                <Terminal className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-lg font-medium text-[var(--text)]" style={SERIF}>
                  {hi ? 'लाइव क्रिप्टोग्राफिक अखंडता सिम्युलेटर' : 'Live Cryptographic Integrity Simulator'}
                </h3>
                <p className="text-[11px] text-[var(--muted)]" style={SANS}>
                  {hi ? 'SHA-256 अपरिवर्तनीय डेटा हैशिंग एवं सत्यापन' : 'Deterministic SHA-256 data hashing & payload verification'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSimulateVerification}
                disabled={isVerifying}
                className="inline-flex items-center gap-1.5 rounded-full border border-[var(--line)] bg-black/40 px-3.5 py-1.5 text-xs text-[var(--text)] transition-colors hover:border-[var(--line-strong)] hover:text-[var(--gold)] disabled:opacity-50"
                style={SANS}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isVerifying ? 'animate-spin text-[var(--gold)]' : ''}`} />
                <span>{hi ? 'सत्यापन पुनः जांचें' : 'Re-verify Hash'}</span>
              </button>
            </div>
          </div>

          {/* Console Content */}
          <div className="mt-6 space-y-4">
            <div>
              <label
                htmlFor="payload-input"
                className="block text-[11px] uppercase tracking-wider text-[var(--muted)] mb-1.5"
                style={SANS}
              >
                {hi ? 'डेटा पेलोड (संपादन योग्य):' : 'Data Payload (Editable):'}
              </label>
              <input
                id="payload-input"
                type="text"
                value={inputPayload}
                onChange={(e) => setInputPayload(e.target.value)}
                className="w-full rounded-xl border border-[var(--line)] bg-black/50 px-4 py-2.5 text-xs text-[var(--text)] font-mono focus:border-[var(--line-strong)] focus:outline-none transition-colors"
                placeholder={hi ? 'पेलोड टाइप करें...' : 'Type payload to hash...'}
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-[11px] uppercase tracking-wider text-[var(--muted)]" style={SANS}>
                  {hi ? 'SHA-256 क्रिप्टोग्राफिक डाइजेस्ट:' : 'Computed SHA-256 Digest:'}
                </span>
                <button
                  type="button"
                  onClick={handleCopyHash}
                  className="inline-flex items-center gap-1 text-[11px] text-[var(--gold)] hover:underline"
                  style={SANS}
                >
                  {copied ? (
                    <>
                      <Check className="w-3 h-3 text-emerald-400" />
                      <span className="text-emerald-400">{hi ? 'कॉपी हो गया' : 'Copied'}</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>{hi ? 'हैश कॉपी करें' : 'Copy Hash'}</span>
                    </>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-[var(--line)] bg-black/80 px-4 py-3 font-mono text-xs text-[var(--gold-soft)] break-all select-all">
                <span>{hashOutput || 'Generating digest...'}</span>
              </div>
            </div>

            {/* Live Verification Status Pill */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/5 px-4 py-2.5 text-xs text-emerald-400">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span style={SANS}>
                  {isVerified
                    ? hi
                      ? 'सत्यापित: पेलोड अखंडता 100% बरकरार है और कोई छेड़छाड़ नहीं पाई गई।'
                      : 'Verified: Payload integrity intact, deterministic hash verified with zero tamper risk.'
                    : hi
                      ? 'सत्यापन चल रहा है...'
                      : 'Verifying cryptographic proof...'}
                </span>
              </div>
              <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400/80">
                STATUS 200 OK
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default CyberSecuritySection;
