/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { ImageProvider, useImages } from './context/ImageContext';
import { sound } from './components/audio/SoundEffects';

// Background & 3D
import { CyberBackground } from './components/CyberBackground';
import { CinematicCanvas3D } from './components/three/CinematicCanvas3D';
import { MysticTouchSparks } from './components/vfx/MysticTouchSparks';
import { BackgroundMusic } from './components/audio/BackgroundMusic';
import { IntroScreen } from './components/vfx/IntroScreen';
import { CinematicScrollHUD } from './components/CinematicScrollHUD';
import { CyberNavbar } from './components/CyberNavbar';

// Sections
import { HeroSection } from './components/sections/HeroSection';
import { AboutSection } from './components/sections/AboutSection';
import { UniversalTechConsole } from './components/sections/UniversalTechConsole';
import { CyberSecuritySection } from './components/sections/CyberSecuritySection';
import { SkillsSection } from './components/sections/SkillsSection';
import { RoadmapSection } from './components/sections/RoadmapSection';
import { ProjectsSection } from './components/sections/ProjectsSection';
import { GallerySection } from './components/sections/GallerySection';
import { GuestbookSection } from './components/sections/GuestbookSection';
import { VisionSection } from './components/sections/VisionSection';
import { ContactSection } from './components/sections/ContactSection';
import { Footer } from './components/sections/Footer';

// Modals & Interactive Floating Widgets
import { FamilyVaultModal } from './components/family/FamilyVaultModal';
import { AdminModal } from './components/admin/AdminModal';
import { GlobalPortfolioErrorBoundary } from './components/vfx/GlobalPortfolioErrorBoundary';

// Lazy-loaded Friends Universe (loaded strictly on button tap to protect portfolio speed)
const FriendsUniverse = React.lazy(() => import('./friends/FriendsUniverse'));

class FriendsErrorBoundary extends React.Component<
  { children: React.ReactNode; onClose: () => void },
  { hasError: boolean; errorMsg: string }
> {
  constructor(props: { children: React.ReactNode; onClose: () => void }) {
    super(props);
    this.state = { hasError: false, errorMsg: '' };
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, errorMsg: error?.message || String(error) };
  }
  componentDidCatch(error: any, errorInfo: any) {
    console.error('Friends Universe ErrorBoundary caught:', error, errorInfo);
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="fixed inset-0 z-50 bg-[#0A0D14]/95 backdrop-blur-2xl flex flex-col items-center justify-center p-6 text-center text-slate-200 font-sans">
          <div className="max-w-md p-6 rounded-2xl bg-slate-900 border border-rose-500/50 shadow-2xl space-y-4">
            <div className="w-12 h-12 mx-auto rounded-full bg-rose-500/20 text-rose-400 flex items-center justify-center font-bold text-xl">
              ⚠️
            </div>
            <h3 className="text-base font-bold text-white">Friends Universe लोड करने में समस्या आई</h3>
            <p className="text-xs text-slate-400 leading-relaxed font-mono">
              {this.state.errorMsg || 'सिस्टम को लोड करते समय अप्रत्याशित समस्या हुई।'}
            </p>
            <div className="flex items-center justify-center gap-3 pt-2">
              <button
                onClick={() => this.setState({ hasError: false, errorMsg: '' })}
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 font-bold text-xs cursor-pointer"
              >
                फिर कोशिश करें (Retry)
              </button>
              <button
                onClick={this.props.onClose}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-mono cursor-pointer"
              >
                बंद करें (Close)
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

const MainPortfolio: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings } = useImages();

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFamilyVaultOpen, setIsFamilyVaultOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(false);

  // Intro Screen state: false by default so portfolio is instantly visible
  const [showIntro, setShowIntro] = useState(false);

  const handleIntroComplete = () => {
    setShowIntro(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mohit_intro_seen', 'true');
    }
  };

  const activeScenes = siteSettings.scenes?.activeScenes || {
    hero: true,
    techConsole: true,
    about: true,
    skills: true,
    roadmap: true,
    projects: true,
    gallery: true,
    guestbook: true,
    vision: true,
    contact: true,
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden">
      {/* Cinematic Multiverse Canvas & Particle Backgrounds */}
      <CyberBackground />
      <CinematicCanvas3D isPaused={isFriendsOpen} />
      <MysticTouchSparks />
      <BackgroundMusic />

      {/* Exploded View Intro Screen */}
      {showIntro && siteSettings.explodedIntro?.enabled !== false && (
        <IntroScreen onComplete={handleIntroComplete} />
      )}

      {/* Sticky Cyber Navbar */}
      <CyberNavbar
        onOpenAdmin={() => {
          sound.playClick();
          setIsAdminOpen(true);
        }}
        onOpenFamilyVault={() => {
          sound.playClick();
          setIsFamilyVaultOpen(true);
        }}
        onOpenFriends={() => {
          sound.playClick();
          setIsFriendsOpen(true);
        }}
      />

      {/* Floating 3D HUD */}
      <CinematicScrollHUD />

      {/* Main Content Sections */}
      <main className="relative z-10">
        {activeScenes.hero !== false && (
          <HeroSection isPaused={isFriendsOpen} />
        )}

        {activeScenes.about !== false && (
          <AboutSection />
        )}

        {activeScenes.techConsole !== false && (
          <UniversalTechConsole />
        )}

        <CyberSecuritySection />

        {activeScenes.skills !== false && (
          <SkillsSection />
        )}

        {activeScenes.roadmap !== false && (
          <RoadmapSection />
        )}

        {activeScenes.projects !== false && (
          <ProjectsSection />
        )}

        {activeScenes.gallery !== false && (
          <GallerySection />
        )}

        {activeScenes.guestbook !== false && (
          <GuestbookSection />
        )}

        {activeScenes.vision !== false && (
          <VisionSection />
        )}

        {activeScenes.contact !== false && (
          <ContactSection />
        )}
      </main>

      {/* Footer with Admin & Social Access */}
      <Footer onOpenAdmin={() => setIsAdminOpen(true)} />

      {/* Floating Modals */}

      <FamilyVaultModal
        isOpen={isFamilyVaultOpen}
        onClose={() => setIsFamilyVaultOpen(false)}
      />

      <AdminModal
        isOpen={isAdminOpen}
        onClose={() => setIsAdminOpen(false)}
      />
      {/* Friends Universe 3D Modal (Lazy Loaded with Error Boundary) */}
      {isFriendsOpen && (
        <FriendsErrorBoundary onClose={() => setIsFriendsOpen(false)}>
          <React.Suspense
            fallback={
              <div className="fixed inset-0 z-50 bg-[#0A0D14] flex flex-col items-center justify-center text-[#00f2fe] font-mono text-sm gap-3">
                <div className="w-10 h-10 rounded-full border-2 border-[#00f2fe] border-t-transparent animate-spin" />
                <span>Friends Universe 3D लोड हो रहा है...</span>
              </div>
            }
          >
            <FriendsUniverse
              isOpen={isFriendsOpen}
              onClose={() => setIsFriendsOpen(false)}
              isPortfolioLowEffects={typeof window !== 'undefined' && localStorage.getItem('mohit_low_effects') === 'true'}
            />
          </React.Suspense>
        </FriendsErrorBoundary>
      )}
    </div>
  );
};

export default function App() {
  return (
    <GlobalPortfolioErrorBoundary>
      <LanguageProvider>
        <ImageProvider>
          <MainPortfolio />
        </ImageProvider>
      </LanguageProvider>
    </GlobalPortfolioErrorBoundary>
  );
}
