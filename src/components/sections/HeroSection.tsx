import React, { useMemo } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '../../context/LanguageContext';
import { useImages } from '../../context/ImageContext';
import { sound } from '../audio/SoundEffects';
import { FloatingPhoneHero3D } from '../three/FloatingPhoneHero3D';
import { MysticTextReveal } from '../vfx/MysticTextReveal';
import { BlackMagicSmoke } from '../vfx/BlackMagicSmoke';
import { ArrowRight, Mail, Sparkles } from 'lucide-react';

interface HeroSectionProps {
  isPaused?: boolean;
}

export const HeroSection: React.FC<HeroSectionProps> = ({ isPaused = false }) => {
  const { mode } = useLanguage();
  const { mainProfileImage, heroOrbitImages, siteSettings } = useImages();

  const localPhoto = typeof window !== 'undefined' ? localStorage.getItem('mohit_profile_photo') : null;
  const activeCentralPhoto = useMemo(() => {
    if (mainProfileImage) return mainProfileImage;
    if (localPhoto) {
      return {
        id: 'local_avatar',
        downloadUrl: localPhoto,
        caption: 'Mohit Yadav',
        captionHi: 'मोहित यादव',
        section: 'profile' as const,
        category: 'personal' as const,
        displayOrder: 0,
        isPublished: true,
        isMainProfile: true,
        isHeroOrbit: true,
        storagePath: 'local',
        createdAt: null,
      };
    }
    return null;
  }, [mainProfileImage, localPhoto]);

  const heroTitle = siteSettings.hero?.heroTitle || siteSettings.heroTitle || 'MOHIT YADAV';
  const heroSubtitle =
    mode === 'hi'
      ? 'भावी AI इंजीनियर | पायथन डेवलपर | वेब व ऐप निर्माता'
      : siteSettings.hero?.heroSubtitle ||
        siteSettings.heroSubtitle ||
        siteSettings.profile?.title ||
        'Future AI Engineer | Python Developer | Web & App Creator';

  const heroBio =
    mode === 'hi'
      ? 'कक्षा 12 (BSEB) विज्ञान का छात्र, जो जिज्ञासा को वास्तविक AI, पायथन और वेब सिस्टम में बदल रहा है।'
      : "Class 12 Science student turning curiosities into high-impact AI, Python, and web systems.";

  const scrollToSection = (id: string) => {
    sound.playClick();
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="hero"
      className="relative min-h-[calc(100vh-4rem)] flex flex-col justify-center pt-6 pb-12 px-4 sm:px-6 lg:px-8 overflow-hidden select-none"
    >
      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center relative z-10">
        {/* Left Column: Pure Text Over 3D */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 space-y-5 order-2 lg:order-1 text-left"
        >
          {/* Arcane Kicker */}
          <div className="inline-flex items-center gap-2 text-xs font-mono tracking-wider text-amber-400 drop-shadow-[0_0_8px_rgba(245,158,11,0.5)]">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>MOHIT YADAV • CLASS 12 SCIENCE • BSEB</span>
          </div>

          {/* Majestic Hero Typography */}
          <BlackMagicSmoke theme="crimson">
            <div className="space-y-2">
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-cyber font-black tracking-tight text-white leading-[1.05] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                <MysticTextReveal
                  text={heroTitle}
                  magicTheme="gold"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-rose-100 to-amber-400"
                />
              </h1>
              <p className="text-base sm:text-lg font-mono text-amber-200/90 font-medium tracking-wide drop-shadow-[0_2px_12px_rgba(245,158,11,0.3)]">
                {heroSubtitle}
              </p>
            </div>
          </BlackMagicSmoke>

          {/* 1-2 Short Lines Bio Narrative */}
          <BlackMagicSmoke theme="multi">
            <p className="text-gray-200 font-sans text-base sm:text-lg leading-relaxed max-w-xl drop-shadow-[0_2px_14px_rgba(0,0,0,0.85)]">
              {heroBio}
            </p>
          </BlackMagicSmoke>

          {/* Interactive CTAs */}
          <div className="flex flex-wrap items-center gap-3.5 pt-1">
            <button
              onClick={() => scrollToSection('about')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-gray-950 font-cyber font-bold text-xs uppercase tracking-wider hover:from-amber-400 hover:to-rose-400 transition-all duration-200 shadow-xl shadow-amber-500/25 hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <span>{mode === 'hi' ? 'पोर्टफोलियो देखें' : 'Explore Portfolio'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => scrollToSection('contact')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900/80 hover:bg-slate-800 text-slate-200 hover:text-white font-cyber font-semibold text-xs uppercase tracking-wider border border-amber-500/30 hover:border-amber-400 transition shadow-lg shadow-black/50 cursor-pointer backdrop-blur-md"
            >
              <Mail className="w-4 h-4 text-amber-400" />
              <span>{mode === 'hi' ? 'संपर्क करें' : 'Contact Me'}</span>
            </button>
          </div>

          {/* Concise 4 Badges */}
          <div className="pt-2 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
            <div>
              <span className="text-[10px] text-gray-400 block">EDUCATION</span>
              <span className="font-bold text-amber-300 text-xs">Class 12 Sci</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">CORE DEV</span>
              <span className="font-bold text-rose-300 text-xs">Python &amp; AI</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">PROJECTS</span>
              <span className="font-bold text-amber-200 text-xs">6 Real Builds</span>
            </div>
            <div>
              <span className="text-[10px] text-gray-400 block">MISSION</span>
              <span className="font-bold text-cyan-300 text-xs">AI Engineer</span>
            </div>
          </div>
        </motion.div>

        {/* Right Column: Floating 3D Smartphone */}
        <motion.div
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.0, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="lg:col-span-6 relative flex flex-col items-center order-1 lg:order-2 w-full"
        >
          <FloatingPhoneHero3D
            centralImage={activeCentralPhoto}
            orbitImages={heroOrbitImages}
            onExplore={() => scrollToSection('about')}
            isPaused={isPaused}
          />
        </motion.div>
      </div>
    </section>
  );
};
