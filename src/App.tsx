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
import { CyberBootPreloader } from './components/vfx/CyberBootPreloader';
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

// Interactive Floating Widgets
import { Floating3DFireFriendsButton } from './components/vfx/Floating3DFireFriendsButton';
import { GlobalPortfolioErrorBoundary } from './components/vfx/GlobalPortfolioErrorBoundary';

// Lazy-loaded Modals (loaded on-demand only when opened to reduce initial bundle)
const FamilyVaultModal = React.lazy(() =>
  import('./components/family/FamilyVaultModal').then((m) => ({ default: m.FamilyVaultModal }))
);
const AdminModal = React.lazy(() =>
  import('./components/admin/AdminModal').then((m) => ({ default: m.AdminModal }))
);

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

// Helper to check if opening via direct friend profile share link
export const checkIsFriendsShareLink = () => {
  if (typeof window === 'undefined') return false;
  try {
    const params = new URLSearchParams(window.location.search);
    if (params.get('friend') || params.get('friends') || params.get('universe')) {
      return true;
    }
    const hash = window.location.hash || '';
    if (hash.startsWith('#friend=') || hash === '#friends' || hash === '#universe') {
      return true;
    }
    const path = window.location.pathname.toLowerCase();
    if (path.includes('/friend') || path.includes('/friends') || path.includes('/universe')) {
      return true;
    }
  } catch {}
  return false;
};

const MainPortfolio: React.FC = () => {
  const { mode } = useLanguage();
  const { siteSettings, mainProfileImage, heroOrbitImages } = useImages();

  // Modals state
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [isFamilyVaultOpen, setIsFamilyVaultOpen] = useState(false);
  const [isFriendsOpen, setIsFriendsOpen] = useState(checkIsFriendsShareLink);

  // Futuristic Boot Preloader: runs on initial visit for 1.6s to pre-render 3D assets and photos,
  // BUT skips immediately if opening a direct shared friend link so friend profile loads instantly!
  const [isBooting, setIsBooting] = useState(() => {
    if (typeof window === 'undefined') return false;
    if (checkIsFriendsShareLink()) return false;
    return !sessionStorage.getItem('mohit_boot_completed');
  });

  // Watch URL params for browser navigation or direct clicks
  useEffect(() => {
    const handleUrlCheck = () => {
      if (checkIsFriendsShareLink()) {
        setIsFriendsOpen(true);
        setIsBooting(false);
      }
    };
    window.addEventListener('popstate', handleUrlCheck);
    window.addEventListener('hashchange', handleUrlCheck);
    return () => {
      window.removeEventListener('popstate', handleUrlCheck);
      window.removeEventListener('hashchange', handleUrlCheck);
    };
  }, []);

  const handleBootComplete = () => {
    setIsBooting(false);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem('mohit_boot_completed', 'true');
    }
  };

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
    <div
      onTouchStartCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      onTouchMoveCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      onTouchEndCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      onPointerDownCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      onScrollCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      onClickCapture={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-slate-950 relative overflow-x-hidden"
    >
      {/* High-Tech Cyber Boot Preloader (1.6s) to ensure instant zero-delay visual display */}
      {isBooting && (
        <CyberBootPreloader
          onComplete={handleBootComplete}
          primaryPhotoUrl={mainProfileImage?.downloadUrl}
          orbitPhotoUrls={heroOrbitImages.map((img) => img.downloadUrl)}
        />
      )}

      {/* Cinematic Multiverse Canvas & Particle Backgrounds */}
      <CyberBackground />
      <CinematicCanvas3D isPaused={isFriendsOpen} />
      <MysticTouchSparks />

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

        {activeScenes.cybersecurity !== false && (
          <CyberSecuritySection />
        )}

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

      {/* Floating Modals (Loaded on-demand only when triggered) */}
      {isFamilyVaultOpen && (
        <React.Suspense fallback={null}>
          <FamilyVaultModal
            isOpen={isFamilyVaultOpen}
            onClose={() => setIsFamilyVaultOpen(false)}
          />
        </React.Suspense>
      )}

      {isAdminOpen && (
        <React.Suspense fallback={null}>
          <AdminModal
            isOpen={isAdminOpen}
            onClose={() => setIsAdminOpen(false)}
          />
        </React.Suspense>
      )}

      {/* 3D Fiery Floating Friends Button (Bottom Screen Magnet) */}
      <Floating3DFireFriendsButton
        isVisible={!isFriendsOpen && !isBooting}
        onClick={() => {
          sound.playWarp();
          setIsFriendsOpen(true);
        }}
      />
      {/* Friends Universe 3D Modal (Lazy Loaded with Error Boundary) */}
      {isFriendsOpen && (
        <FriendsErrorBoundary
          onClose={() => {
            setIsFriendsOpen(false);
            try {
              const url = new URL(window.location.href);
              url.searchParams.delete('friend');
              url.searchParams.delete('friends');
              url.searchParams.delete('universe');
              if (url.hash.startsWith('#friend=') || url.hash === '#friends') {
                url.hash = '';
              }
              window.history.replaceState({}, '', url.pathname + (url.search || '') + (url.hash || ''));
            } catch {}
          }}
        >
          <React.Suspense
            fallback={
              <div
                onTouchStartCapture={() => (window as any).__startBackgroundMusic?.()}
                onTouchMoveCapture={() => (window as any).__startBackgroundMusic?.()}
                onTouchEndCapture={() => (window as any).__startBackgroundMusic?.()}
                onPointerDownCapture={() => (window as any).__startBackgroundMusic?.()}
                onScrollCapture={() => (window as any).__startBackgroundMusic?.()}
                onClickCapture={() => (window as any).__startBackgroundMusic?.()}
                className="fixed inset-0 z-50 bg-[#0A0D14] flex flex-col items-center justify-center p-6 text-center select-none"
              >
                <div className="absolute w-72 h-72 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none animate-pulse" />
                <div className="relative z-10 inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0d1527]/90 border border-[#00f2fe]/30 shadow-[0_0_15px_rgba(0,242,254,0.15)] mb-4">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#00f2fe] opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#00f2fe]" />
                  </span>
                  <span className="text-[11px] font-mono font-semibold tracking-widest text-[#00f2fe] uppercase">
                    FRIEND NETWORK ACTIVE
                  </span>
                </div>
                <h2 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-wider uppercase font-mono bg-gradient-to-r from-[#00f2fe] via-[#38bdf8] to-[#818cf8] bg-clip-text text-transparent drop-shadow-[0_0_25px_rgba(0,242,254,0.65)] animate-pulse">
                  Welcome, Mohit
                </h2>
                <div className="relative w-48 sm:w-56 h-[2px] my-3.5 bg-[#14233c] rounded-full overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#00f2fe] to-transparent w-full animate-pulse shadow-[0_0_8px_#00f2fe]" />
                </div>
                <p className="text-xs sm:text-sm font-medium text-[#8fa3bf] tracking-wide flex items-center gap-2 mt-1">
                  <span className="text-[#00f2fe] font-mono text-xs">SYS//SYNC</span>
                  <span>•</span>
                  <span>फ्रेंड्स यूनिवर्स लोड हो रहा है...</span>
                </p>
              </div>
            }
          >
            <FriendsUniverse
              isOpen={isFriendsOpen}
              onClose={() => {
                setIsFriendsOpen(false);
                try {
                  const url = new URL(window.location.href);
                  url.searchParams.delete('friend');
                  url.searchParams.delete('friends');
                  url.searchParams.delete('universe');
                  if (url.hash.startsWith('#friend=') || url.hash === '#friends') {
                    url.hash = '';
                  }
                  window.history.replaceState({}, '', url.pathname + (url.search || '') + (url.hash || ''));
                } catch {}
              }}
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
          {/* Application-Wide Background Music Engine: Active across all pages, direct links, and tabs */}
          <BackgroundMusic />
          <MainPortfolio />
        </ImageProvider>
      </LanguageProvider>
    </GlobalPortfolioErrorBoundary>
  );
}
