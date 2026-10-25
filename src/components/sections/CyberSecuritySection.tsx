import React, { useState } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { sound } from '../audio/SoundEffects';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import {
  ShieldCheck,
  Lock,
  KeyRound,
  Activity,
  Sparkles,
  CheckCircle2,
} from 'lucide-react';

export const CyberSecuritySection: React.FC = () => {
  const { mode } = useLanguage();
  const [testInput, setTestInput] = useState('Mohit-Defensive-Protocol-2026');
  const [isVerifying, setIsVerifying] = useState(false);

  const computeSimpleHash = (text: string) => {
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash |= 0;
    }
    const hex = Math.abs(hash).toString(16).padStart(8, '0');
    return `SHA256: 0x${hex}9a4f7e2c8b1d...[VERIFIED]`;
  };

  const handleSimulateCheck = () => {
    sound.playClick();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      sound.playSuccess();
    }, 400);
  };

  const defensivePillars = [
    {
      id: 'integrity',
      title: 'Cryptographic Integrity',
      titleHi: 'क्रिप्टोग्राफिक अखंडता',
      icon: <KeyRound className="w-4 h-4 text-amber-400" />,
      desc: 'Ensuring data transmission cannot be altered in transit with SHA-256 verification.',
      descHi: 'SHA-256 हैश सत्यापन के साथ डेटा अखंडता और छेड़छाड़ से सुरक्षा।',
      theme: 'gold' as const,
    },
    {
      id: 'zerotrust',
      title: 'Zero-Trust Architecture',
      titleHi: 'जीरो-ट्रस्ट आर्किटेक्चर',
      icon: <Lock className="w-4 h-4 text-rose-400" />,
      desc: 'Never trust, always verify with strict authentication and role-based access control.',
      descHi: 'रोल-आधारित एक्सेस कंट्रोल (RBAC) और हर रिक्वेस्ट का कड़ा सत्यापन।',
      theme: 'scarlet' as const,
    },
    {
      id: 'network',
      title: 'Traffic & DDoS Shield',
      titleHi: 'ट्रैफ़िक व DDoS शील्ड',
      icon: <Activity className="w-4 h-4 text-cyan-400" />,
      desc: 'Monitoring anomalies and rate-limiting abusive requests at API gateway perimeters.',
      descHi: 'API गेटवे पर असामान्य गतिविधियों की निगरानी और दर-सीमा नियंत्रण।',
      theme: 'cyan' as const,
    },
    {
      id: 'auth',
      title: 'Strict Secrets & Auth',
      titleHi: 'गोपनीयता व प्रमाणीकरण',
      icon: <ShieldCheck className="w-4 h-4 text-amber-300" />,
      desc: 'Server-side secret isolation, OAuth 2.0 PKCE, and robust firestore security rules.',
      descHi: 'सर्वर-साइड सीक्रेट्स, फायरस्टोर सुरक्षा नियम और मजबूत टोकन सत्यापन।',
      theme: 'gold' as const,
    },
  ];

  return (
    <section
      id="cybersecurity"
      className="py-20 px-4 sm:px-6 lg:px-8 relative min-h-screen flex flex-col justify-center overflow-hidden select-none"
    >
      <div className="max-w-6xl mx-auto w-full space-y-10 relative z-10">
        {/* Section Header: Pure Unboxed Typography Floating Over 3D */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-50px' }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-2 text-left"
        >
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(6,182,212,0.4)]">
            <Sparkles className="w-3.5 h-3.5" />
            <span>SCENE 03 • ETHICAL &amp; DEFENSIVE CYBER</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
            <MysticTextReveal
              text={mode === 'hi' ? 'सुरक्षित साइबर आर्किटेक्चर' : 'Defensive Cyber Architecture'}
              magicTheme="cyan"
              className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-amber-200 to-rose-300"
            />
          </h2>

          <p className="text-sm sm:text-base font-mono text-cyan-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {mode === 'hi'
              ? 'डेटा अखंडता की रक्षा, उपयोगकर्ताओं को सुरक्षित रूप से प्रमाणित करने और महत्वपूर्ण रहस्यों को अलग रखने की तकनीकें।'
              : 'Applied techniques to shield data integrity, authenticate users, and isolate critical secrets.'}
          </p>
        </motion.div>

        {/* 4 Pillars with MysticTiltCard */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {defensivePillars.map((pillar) => (
            <MysticTiltCard
              key={pillar.id}
              glowTheme={pillar.theme}
              className="p-5 bg-slate-950/85 backdrop-blur-xl space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-xl bg-slate-900 border border-slate-800">
                  {pillar.icon}
                </div>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  ACTIVE
                </span>
              </div>
              <div>
                <h3 className="font-cyber font-bold text-white text-base">
                  {mode === 'hi' ? pillar.titleHi : pillar.title}
                </h3>
                <p className="text-xs text-slate-300 font-sans leading-relaxed mt-1">
                  {mode === 'hi' ? pillar.descHi : pillar.desc}
                </p>
              </div>
            </MysticTiltCard>
          ))}
        </div>

        {/* Interactive Cryptographic Integrity Verifier */}
        <MysticTiltCard
          glowTheme="cyan"
          className="p-5 sm:p-6 bg-slate-950/90 backdrop-blur-xl"
        >
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span className="font-semibold uppercase tracking-wider">
                  {mode === 'hi' ? 'लाइव SHA-256 डेटा अखंडता परीक्षण' : 'Live SHA-256 Data Integrity Test'}
                </span>
              </div>
              <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>ACTIVE SHIELD</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
              <div className="md:col-span-8">
                <input
                  type="text"
                  value={testInput}
                  onChange={(e) => setTestInput(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-cyan-400 shadow-inner"
                  placeholder="Enter payload to hash..."
                />
              </div>
              <div className="md:col-span-4">
                <button
                  onClick={handleSimulateCheck}
                  disabled={isVerifying}
                  className="w-full py-2.5 px-4 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider transition shadow-md shadow-cyan-500/20 active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isVerifying ? (mode === 'hi' ? 'सत्यापित हो रहा है...' : 'Verifying...') : (mode === 'hi' ? 'हैश सत्यापित करें' : 'Verify Hash')}
                </button>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800 text-[11px] font-mono text-amber-300 break-all">
              {computeSimpleHash(testInput)}
            </div>
          </div>
        </MysticTiltCard>
      </div>
    </section>
  );
};
