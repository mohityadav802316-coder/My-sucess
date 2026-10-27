import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import './friends.css';
import { CategoryKey } from './data/friends';
import { useFriends, useFriend, useFriendsConfig } from './data/repository';
import { CategoryTabs } from './components/CategoryTabs';
import { AllFriendsList } from './components/AllFriendsList';
import { CategoryPage } from './components/CategoryPage';
import { FriendHeroProfile3D } from './components/FriendHeroProfile3D';
import { FullProfileModal } from './components/FullProfileModal';
import { LightboxModal } from './components/LightboxModal';
import { BackgroundUniverse3D, FXLevel } from './components/BackgroundUniverse3D';
import { FXToggle } from './components/FXToggle';
import { FriendsWelcomeLoader } from './components/FriendsWelcomeLoader';
import { initTilt } from './utils/tiltManager';
import { isUserAdmin, auth } from '../firebase';
import { ArrowLeft, X, AlertTriangle, RefreshCw, Sparkles } from 'lucide-react';

interface FriendsUniverseProps {
  isOpen: boolean;
  onClose: () => void;
  isPortfolioLowEffects?: boolean;
}

export const FriendsUniverse: React.FC<FriendsUniverseProps> = ({
  isOpen,
  onClose,
  isPortfolioLowEffects = false,
}) => {
  // 1. Category state: default is 'all' (All Friends)
  const [currentCategory, setCurrentCategory] = useState<CategoryKey>('all');

  // Dedicated Full-Screen Category Page state ('prefer' | 'squad' | 'ff' | 'online' | 'digital' | null)
  const [activeCategoryPage, setActiveCategoryPage] = useState<CategoryKey | null>(null);

  // Warp effect timestamp trigger
  const [warpTrigger, setWarpTrigger] = useState<number>(0);

  // Selected friend index for each category dock (persisted across visits)
  const [categorySelectedIndex, setCategorySelectedIndex] = useState<Record<string, number>>({
    prefer: 0,
    squad: 0,
    ff: 0,
    online: 0,
    digital: 0,
  });

  // Active full profile modal friend ID
  const [activeProfileId, setActiveProfileId] = useState<string | null>(null);

  // Active lightbox image preview
  const [lightboxImageUrl, setLightboxImageUrl] = useState<string | null>(null);

  // FX Level: high / low / minimal (honors portfolio Low Effects)
  const [fxLevel, setFxLevel] = useState<FXLevel>(() => {
    if (isPortfolioLowEffects) return 'low';
    if (typeof window !== 'undefined') {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return 'minimal';
      }
      if ((navigator.hardwareConcurrency || 4) <= 4) {
        return 'low';
      }
    }
    return 'high';
  });



  // Friends settings from Firebase Firestore
  const { settings } = useFriendsConfig();

  // Repository live data layer from Firestore
  const {
    friends: mainFriends,
    isLoading: isMainLoading,
    error: mainError,
    refetch: refetchMain,
  } = useFriends('all');

  const { friends: categoryFriends } = useFriends(
    activeCategoryPage || undefined
  );
  const { friend: activeFriend } = useFriend(activeProfileId);

  const currentSelectedFriend = useMemo(() => {
    if (!activeProfileId) return null;
    return (
      activeFriend ||
      mainFriends.find((f) => f.id === activeProfileId) ||
      categoryFriends.find((f) => f.id === activeProfileId) ||
      null
    );
  }, [activeProfileId, activeFriend, mainFriends, categoryFriends]);



  // Synchronize when portfolio Low Effects setting changes
  useEffect(() => {
    if (isPortfolioLowEffects) {
      setFxLevel('low');
    }
  }, [isPortfolioLowEffects]);

  // Initialize 3D Gyroscope & Parallax Manager on mount
  useEffect(() => {
    if (isOpen) {
      initTilt();
    }
  }, [isOpen]);

  // Deep linking URL check (?friend=ID or #friend=ID)
  useEffect(() => {
    if (isOpen && typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const friendParam = urlParams.get('friend');
      if (friendParam) {
        setActiveProfileId(friendParam);
        return;
      }
      const hash = window.location.hash;
      if (hash.startsWith('#friend=')) {
        const id = hash.replace('#friend=', '');
        if (id) setActiveProfileId(id);
      }
    }
  }, [isOpen]);

  // Lock body scroll when Friends Universe is active
  useEffect(() => {
    if (!isOpen) return;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen]);

  const hasPushedOpenHistory = useRef(false);

  // Open dedicated category page
  const handleOpenCategoryPage = useCallback((cat: CategoryKey, pushHistory = true) => {
    setActiveCategoryPage(cat);
    setCurrentCategory(cat);
    setWarpTrigger(Date.now()); // Trigger starfield warp effect!
    if (pushHistory) {
      try {
        window.history.pushState({ friendsCategoryPage: cat }, '');
      } catch (e) {
        // Safe fallback in sandboxed iframes
      }
    }
  }, []);

  // Close category page and return to main All Friends
  const handleCloseCategoryPage = useCallback((popHistory = true) => {
    setActiveCategoryPage(null);
    setCurrentCategory('all');
    if (popHistory && window.history.state?.friendsCategoryPage) {
      try {
        window.history.back();
      } catch (e) {}
    }
  }, []);

  // Open friend full profile with browser history state integration
  const handleOpenProfile = useCallback((id: string, pushHistory = true) => {
    setActiveProfileId(id);
    if (pushHistory) {
      try {
        window.history.pushState({ friendsProfileId: id }, '');
      } catch (e) {}
    }
  }, []);

  // Close profile
  const handleCloseProfile = useCallback((popHistory = true) => {
    setActiveProfileId(null);
    if (popHistory && window.history.state?.friendsProfileId) {
      try {
        window.history.back();
      } catch (e) {}
    }
  }, []);

  // Handle browser back button (nested popstate)
  useEffect(() => {
    if (!isOpen) {
      hasPushedOpenHistory.current = false;
      return;
    }

    if (!hasPushedOpenHistory.current) {
      try {
        window.history.pushState({ friendsUniverseOpen: true }, '');
      } catch (e) {
        // Sandboxed environment
      }
      hasPushedOpenHistory.current = true;
    }

    const handlePopState = () => {
      // 1. If Lightbox is open, close lightbox first
      if (lightboxImageUrl) {
        setLightboxImageUrl(null);
        return;
      }
      // 2. If profile is open, close profile (and return to category page if it was open)
      if (activeProfileId) {
        setActiveProfileId(null);
        return;
      }
      // 3. If category page is open, close category page and return to main All Friends
      if (activeCategoryPage) {
        setActiveCategoryPage(null);
        setCurrentCategory('all');
        return;
      }
      // 4. Otherwise, close Friends Universe and return to portfolio
      onClose();
    };

    window.addEventListener('popstate', handlePopState);
    return () => {
      window.removeEventListener('popstate', handlePopState);
    };
  }, [isOpen, activeProfileId, activeCategoryPage, lightboxImageUrl, onClose]);

  // Escape key support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (lightboxImageUrl) {
          setLightboxImageUrl(null);
        } else if (activeProfileId) {
          setActiveProfileId(null);
        } else if (activeCategoryPage) {
          setActiveCategoryPage(null);
          setCurrentCategory('all');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, lightboxImageUrl, activeProfileId, activeCategoryPage, onClose]);

  // Handle main category selection
  const handleSelectCategory = (cat: CategoryKey) => {
    setCurrentCategory(cat);
  };

  // Handle dock avatar selection within active category
  const handleSelectDockIndex = useCallback(
    (index: number) => {
      if (activeCategoryPage) {
        setCategorySelectedIndex((prev) => ({
          ...prev,
          [activeCategoryPage]: index,
        }));
      }
    },
    [activeCategoryPage]
  );

  const isAdmin = isUserAdmin(auth.currentUser);
  const showLoader = isMainLoading && mainFriends.length === 0;

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Friends Universe 3D"
      className="friends-universe-root fixed inset-0 z-50 overflow-y-auto overflow-x-hidden flex flex-col justify-between"
      style={{
        background: 'radial-gradient(ellipse 90% 60% at 50% 0%, #1a1440 0%, #0A0D14 65%)',
      }}
    >
      {/* 3D WebGL Background Starfield & Constellation Universe */}
      {settings.features.stars && (
        <BackgroundUniverse3D fxLevel={fxLevel} warpTrigger={warpTrigger} />
      )}

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-4xl mx-auto px-3 sm:px-6 pt-4 pb-12 flex flex-col items-center min-h-screen">
        {/* Top Header with Futuristic Branding, Back to Portfolio, & Controls */}
        <header className="w-full flex items-center justify-between py-2 px-1 mb-2">
          {/* Back to Portfolio Button */}
          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              aria-label="पोर्टफोलियो पर वापस जाएँ"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#1f2b46] bg-[#111726]/90 text-[#00f2fe] hover:bg-[#161f33] hover:border-[#00f2fe] cursor-pointer transition-all text-xs font-semibold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>पोर्टफोलियो</span>
            </button>
            <span className="text-[10px] uppercase font-extrabold tracking-widest text-[#00f2fe] bg-[#00f2fe]/10 border border-[#00f2fe]/30 rounded-md px-2 py-0.5 hidden sm:inline-block">
              3D Hologram v2
            </span>
          </div>

          {/* Right Controls: FX Toggle & Close */}
          <div className="flex items-center gap-2">
            <FXToggle fxLevel={fxLevel} onChangeFX={setFxLevel} />
            <button
              onClick={onClose}
              aria-label="Friends Universe बंद करें"
              className="p-1.5 rounded-full bg-[#111726]/80 border border-[#1f2b46] text-[#8fa3bf] hover:text-[#00f2fe] hover:border-[#00f2fe] cursor-pointer transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </header>

        {/* Title */}
        <div className="text-center my-1 select-none">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-[0.22em] text-[#00f2fe] text-glow-cyan uppercase font-mono">
            {settings.labels.allFriendsTitleHi || 'Friends Universe'}
          </h1>
          <p className="text-xs sm:text-sm text-[#8fa3bf] mt-1 font-medium">
            {settings.labels.subtitleHi || '3D होलोग्राफिक नेटवर्क • इंटरएक्टिव डॉक'}
          </p>
        </div>

        {/* Category Circular Tabs Bar */}
        <nav className="w-full my-3">
          <CategoryTabs
            currentCategory={currentCategory}
            onSelectCategory={handleSelectCategory}
            onOpenCategoryPage={(cat) => handleOpenCategoryPage(cat, true)}
            categories={settings.categories}
          />
        </nav>

        {/* Main Body Area: Loader / Error / Friends List */}
        <div className="w-full flex-grow flex flex-col items-center mt-2 animate-in fade-in duration-300">
          {showLoader ? (
            <FriendsWelcomeLoader statusText="फ्रेंड्स नेटवर्क लोड हो रहा है..." />
          ) : mainError ? (
            /* Section 9 Error State (Strictly NO fake demo friends) */
            <div className="flex flex-col items-center justify-center py-12 px-6 text-center max-w-md mx-auto my-6 rounded-2xl bg-[#111726]/90 border border-rose-500/40 shadow-xl shadow-rose-950/40">
              <div className="w-12 h-12 rounded-full bg-rose-500/10 border border-rose-500/40 flex items-center justify-center text-rose-400 mb-3">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-rose-300 font-mono mb-1">
                {settings.labels.errorTitleHi || 'डेटा लोड करने में समस्या आई'}
              </h3>
              <p className="text-xs text-[#8fa3bf] mb-4 leading-relaxed">
                {mainError.message || 'Firebase Firestore से संपर्क नहीं हो सका। कृपया सुरक्षा नियम या कनेक्शन जांचें।'}
              </p>

              {mainError.message.includes('Rules') && (
                <div className="w-full bg-[#0a0d14] p-3 rounded-xl border border-[#1f2b46] text-left mb-4 font-mono text-[11px] text-[#00f2fe]/90 overflow-x-auto">
                  <div className="text-[10px] text-[#ffb53d] font-bold mb-1">Firebase Console &gt; Firestore &gt; Rules में यह जोड़ें:</div>
                  <pre className="text-[10px] text-slate-300">{`match /friends/{friendId} {
  allow read: if true;
  allow write: if isAdmin();
}`}</pre>
                </div>
              )}

              <button
                onClick={() => refetchMain()}
                className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-cyan-500/20 to-purple-500/20 hover:from-cyan-500/30 hover:to-purple-500/30 text-[#00f2fe] border border-[#00f2fe]/50 cursor-pointer font-semibold text-xs transition-all active:scale-95 shadow-md shadow-cyan-500/10"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>फिर कोशिश करो (Retry)</span>
              </button>
            </div>
          ) : (
            <AllFriendsList
              friends={mainFriends}
              onOpenProfile={(id) => handleOpenProfile(id, true)}
              isAdmin={isAdmin}
              isLoading={isMainLoading}
            />
          )}
        </div>

        {/* Bottom Configuration Note */}
        <footer className="mt-8 pt-4 border-t border-[#1f2b46]/60 w-full text-center">
          <p className="text-xs text-[#8fa3bf] leading-relaxed max-w-lg mx-auto">
            किसी श्रेणी पर tap करके उसका 3D दृश्य देखें।
          </p>
        </footer>
      </main>

      {/* Dedicated 100dvh Category Page (MY SQUAD, Prefer, Free Fire, Online, Digital) */}
      {activeCategoryPage && (
        <CategoryPage
          category={activeCategoryPage}
          friends={categoryFriends}
          selectedIndex={categorySelectedIndex[activeCategoryPage] || 0}
          onSelectIndex={handleSelectDockIndex}
          onOpenProfile={(id) => handleOpenProfile(id, true)}
          onClose={() => handleCloseCategoryPage(true)}
          fxLevel={fxLevel}
        />
      )}

      {/* Personalized Welcome Loading Screen when opening friend profile */}
      {activeProfileId && !currentSelectedFriend && (
        <div className="fixed inset-0 z-50 bg-[#030611]/95 backdrop-blur-2xl flex flex-col items-center justify-center text-center p-6 gap-5">
          <div className="relative flex items-center justify-center w-24 h-24">
            <div
              className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400 animate-spin"
              style={{ filter: 'drop-shadow(0 0 12px #00f2fe)' }}
            />
            <div
              className="absolute inset-3 rounded-full border-2 border-purple-500 animate-spin-reverse"
              style={{ filter: 'drop-shadow(0 0 12px #9b5cff)' }}
            />
            <Sparkles className="w-8 h-8 text-cyan-300 animate-pulse" />
          </div>

          <div className="flex flex-col items-center gap-2">
            <span className="text-xs font-mono tracking-[0.3em] text-cyan-400/80 uppercase">
              HOLOGRAPHIC PROFILE LOADING
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold font-cyber tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-[#00f2fe] via-[#d946ef] to-[#ffb53d] drop-shadow-[0_0_25px_rgba(0,242,254,0.7)]">
              वेलकम दोस्त
            </h2>
            <p className="text-xs font-mono text-slate-400 mt-1">
              साइबर प्रोफाइल और गैलरी तैयार हो रही है...
            </p>
          </div>

          <div className="w-56 h-1.5 bg-slate-900 rounded-full overflow-hidden border border-cyan-500/40 shadow-[0_0_12px_rgba(0,242,254,0.3)]">
            <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-pink-500 animate-pulse w-full" />
          </div>
        </div>
      )}

      {/* Full Cyberpunk Hero Profile Page (Matching Reference Image Exactly) */}
      {activeProfileId && currentSelectedFriend && (
        <FriendHeroProfile3D
          friend={currentSelectedFriend}
          onClose={() => handleCloseProfile(true)}
          onOpenLightbox={(img) => setLightboxImageUrl(img)}
          fxLevel={fxLevel}
        />
      )}

      {/* Lightbox Preview Modal */}
      <LightboxModal
        imageUrl={lightboxImageUrl}
        onClose={() => setLightboxImageUrl(null)}
      />
    </div>
  );
};

export default FriendsUniverse;
