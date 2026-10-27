import React from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { MysticTiltCard } from '../vfx/MysticTiltCard';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import { GraduationCap, Target, Camera, Sparkles, Brain, Cpu, Globe, Binary, Shield, Compass, Heart } from 'lucide-react';

export const AboutSection: React.FC = () => {
  const { mode } = useLanguage();
  const { mainProfileImage, siteSettings } = useImages();

  const localPhotoUrl =
    typeof window !== 'undefined' ? (localStorage.getItem('mohit_profile_photo')?.trim() || null) : null;
  const rawDownloadUrl = mainProfileImage?.downloadUrl?.trim();
  const displayPhotoUrl = (rawDownloadUrl && rawDownloadUrl !== '') ? rawDownloadUrl : localPhotoUrl;

  // 6 Glowing Mystic Badges for Technical Domains
  const technicalBadges = [
    {
      id: 'ai_agents',
      icon: <Brain className="w-3.5 h-3.5 text-amber-400" />,
      en: 'AI Engineering & Agents',
      hi: 'AI इंजीनियरिंग व एजेंट्स',
      glow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)] border-amber-500/40 text-amber-300',
    },
    {
      id: 'python_auto',
      icon: <Cpu className="w-3.5 h-3.5 text-rose-400" />,
      en: 'Python & Automation',
      hi: 'पायथन व ऑटोमेशन',
      glow: 'shadow-[0_0_15px_rgba(225,29,72,0.3)] border-rose-500/40 text-rose-300',
    },
    {
      id: 'web_apps',
      icon: <Globe className="w-3.5 h-3.5 text-cyan-400" />,
      en: 'Web & Mobile Apps',
      hi: 'वेब व मोबाइल ऐप्स',
      glow: 'shadow-[0_0_15px_rgba(6,182,212,0.3)] border-cyan-500/40 text-cyan-300',
    },
    {
      id: 'ml_math',
      icon: <Binary className="w-3.5 h-3.5 text-purple-400" />,
      en: 'Machine Learning Math',
      hi: 'मशीन लर्निंग व गणित',
      glow: 'shadow-[0_0_15px_rgba(168,85,247,0.3)] border-purple-500/40 text-purple-300',
    },
    {
      id: 'spatial_3d',
      icon: <Sparkles className="w-3.5 h-3.5 text-amber-300" />,
      en: '3D Spatial WebGL',
      hi: '3D स्पेशल WebGL',
      glow: 'shadow-[0_0_15px_rgba(251,191,36,0.3)] border-amber-400/40 text-amber-200',
    },
    {
      id: 'cyber_defense',
      icon: <Shield className="w-3.5 h-3.5 text-emerald-400" />,
      en: 'Defensive Cyber Security',
      hi: 'सुरक्षित साइबर आर्किटेक्चर',
      glow: 'shadow-[0_0_15px_rgba(16,185,129,0.3)] border-emerald-500/40 text-emerald-300',
    },
  ];

  return (
    <section
      id="about"
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
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-widest text-rose-400 drop-shadow-[0_0_10px_rgba(225,29,72,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>SCENE 02 • BIOGRAPHY &amp; VISION</span>
          </div>

          <BlackMagicSmoke theme="crimson">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-cyber font-black tracking-wide text-white drop-shadow-[0_2px_20px_rgba(0,0,0,0.9)]">
              <MysticTextReveal
                text={mode === 'hi' ? 'परिचय एवं भविष्य दृष्टिकोण' : 'About Me & Future Vision'}
                magicTheme="scarlet"
                className="text-transparent bg-clip-text bg-gradient-to-r from-rose-200 via-amber-200 to-rose-400"
              />
            </h2>
          </BlackMagicSmoke>

          <BlackMagicSmoke theme="multi">
            <p className="text-sm sm:text-base font-mono text-amber-200/90 max-w-2xl drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
              {mode === 'hi'
                ? 'कक्षा 12 विज्ञान की मजबूत नींव और स्वायत्त AI सिस्टम विकसित करने का दैनिक संकल्प।'
                : 'Class 12 Science foundation combined with daily engineering to architect real AI systems.'}
            </p>
          </BlackMagicSmoke>
        </motion.div>

        {/* 2-Column Responsive Layout: 3D Tilt Photo + Unified Compact Academic & Vision Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: 3D Tilt Photo Card with Mystic Aura */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5 flex flex-col items-center"
          >
            <MysticTiltCard
              glowTheme="scarlet"
              className="w-full max-w-[320px] aspect-[4/5] bg-slate-950/90"
            >
              <div className="w-full h-full relative flex flex-col items-center justify-center p-2">
                {displayPhotoUrl && displayPhotoUrl.trim() !== '' ? (
                  <img
                    src={displayPhotoUrl || undefined}
                    alt="Mohit Yadav - Official Portrait"
                    className="w-full h-full object-cover rounded-2xl"
                  />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center space-y-3 bg-gradient-to-b from-gray-950 via-slate-900 to-gray-950 rounded-2xl">
                    <div className="w-20 h-20 rounded-2xl bg-slate-900 border border-amber-500/30 flex items-center justify-center shadow-lg">
                      <Camera className="w-8 h-8 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-cyber font-bold text-base text-white block">
                        MOHIT YADAV
                      </span>
                      <span className="text-xs font-mono text-amber-300 block">
                        BSEB Class 12 Science
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </MysticTiltCard>
            <div className="mt-3 flex items-center gap-2 text-xs font-mono text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>OFFICIAL PROFILE • VERIFIED BSEB STUDENT</span>
            </div>
          </motion.div>

          {/* Right Column: Combined Academic + Vision Compact Card + 6 Glowing Badges */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-7 space-y-6"
          >
            {/* Combined Academic & Vision Single Card */}
            <MysticTiltCard
              glowTheme="gold"
              className="p-5 sm:p-6 bg-slate-950/85 backdrop-blur-xl space-y-4"
            >
              {/* Academic Part */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-amber-400 text-xs font-mono">
                  <GraduationCap className="w-4 h-4 text-amber-400" />
                  <span className="font-semibold uppercase tracking-wider">
                    {mode === 'hi' ? 'शैक्षणिक आधार' : 'Academic Foundation'}
                  </span>
                </div>
                <h3 className="font-cyber font-bold text-lg sm:text-xl text-white">
                  {mode === 'hi'
                    ? 'कक्षा 12 (विज्ञान) - बिहार विद्यालय परीक्षा समिति (BSEB)'
                    : 'Class 12 Science — Bihar Board (BSEB)'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                  {mode === 'hi'
                    ? 'भौतिकी, रसायन और गणित के सिद्धांतों के साथ दैनिक पायथन प्रोग्रामिंग व सॉफ्टवेयर इंजीनियरिंग का अभ्यास।'
                    : 'Rigorous PCM foundation paired with daily hands-on software development in Python.'}
                </p>
              </div>

              {/* Divider */}
              <div className="h-[1px] bg-gradient-to-r from-transparent via-amber-500/30 to-transparent" />

              {/* Vision Part */}
              <div className="space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 text-xs font-mono">
                  <Target className="w-4 h-4 text-rose-400" />
                  <span className="font-semibold uppercase tracking-wider">
                    {mode === 'hi' ? 'भविष्य दृष्टि और उद्देश्य' : 'Horizon Vision & Purpose'}
                  </span>
                </div>
                <h3 className="font-cyber font-bold text-lg sm:text-xl text-white">
                  {mode === 'hi'
                    ? 'भावी एप्लाइड AI इंजीनियर'
                    : 'Aspiring Applied AI Engineer'}
                </h3>
                <p className="text-slate-300 text-xs sm:text-sm font-sans leading-relaxed">
                  {mode === 'hi'
                    ? 'स्वायत्त AI एजेंट्स और आधुनिक सॉफ़्टवेयर सिस्टम का निर्माण करना जो वास्तविक जीवन में उपयोगी हों।'
                    : 'Architecting autonomous agents and intelligent software that deliver measurable real-world utility.'}
                </p>
              </div>
            </MysticTiltCard>

            {/* Configurable My Hobby / मेरी हॉबी Badge (Toggleable from Admin) */}
            {siteSettings.profile?.showHobby !== false && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-900/90 border border-rose-500/30 shadow-[0_0_15px_rgba(244,63,94,0.15)]">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400">
                    <Heart className="w-4 h-4 text-rose-400" />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-rose-400 font-bold block">
                      {mode === 'hi' ? 'मेरी हॉबी' : 'MY HOBBY'}
                    </span>
                    <span className="text-xs sm:text-sm font-cyber font-bold text-white block">
                      {mode === 'hi'
                        ? (siteSettings.profile?.hobbyHi || 'AI डेवलपर एवं 3D विजुअल्स')
                        : (siteSettings.profile?.hobbyEn || 'AI Developer & Spatial 3D Systems')}
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-mono text-rose-300/80 bg-rose-950/60 px-2 py-0.5 rounded-md border border-rose-500/20">
                  {mode === 'hi' ? 'सक्रिय पैशन' : 'Active Passion'}
                </span>
              </div>
            )}

            {/* 6 Glowing Mystic Badges for Technical Domains */}
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-300">
                <Compass className="w-3.5 h-3.5" />
                <span className="tracking-wider uppercase">
                  {mode === 'hi' ? '6 प्रमुख तकनीकी स्तंभ' : '6 Core Technical Domains'}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {technicalBadges.map((badge) => (
                  <div
                    key={badge.id}
                    className={`flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 border backdrop-blur-md transition-all duration-300 hover:scale-105 cursor-default ${badge.glow}`}
                  >
                    <div className="shrink-0">{badge.icon}</div>
                    <span className="text-[11px] font-mono font-medium truncate">
                      {mode === 'hi' ? badge.hi : badge.en}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
