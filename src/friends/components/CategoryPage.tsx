import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Friend, CategoryKey, DEFAULT_CATEGORIES, resolveImageUrl } from '../data/friends';
import { HoloRing3D } from './HoloRing3D';
import { FXLevel } from './BackgroundUniverse3D';
import { useFriendsConfig } from '../data/repository';

interface CategoryPageProps {
  category: CategoryKey;
  friends: Friend[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenProfile: (id: string) => void;
  onClose: () => void;
  fxLevel?: FXLevel;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({
  category,
  friends,
  selectedIndex,
  onSelectIndex,
  onOpenProfile,
  onClose,
  fxLevel = 'high',
}) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLDivElement>(null);
  const isSquad = category === 'squad';
  const { settings } = useFriendsConfig();

  const [photoIndex, setPhotoIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);

  // View More / View Less state
  const [isExpanded, setIsExpanded] = useState(false);

  // Category Metadata from dynamic settings
  const catMeta = useMemo(() => {
    const list = settings.categories || DEFAULT_CATEGORIES;
    return list.find((c) => c.key === category) || {
      key: category,
      label: category,
      shortLabel: category,
      emoji: '👥',
      description: '',
    };
  }, [category, settings.categories]);

  // Safe index within bounds
  const safeIndex = friends.length > 0 ? Math.min(Math.max(0, selectedIndex), friends.length - 1) : 0;
  const currentFriend = friends[safeIndex];

  // Whenever the active friend changes, reset View More to collapsed
  useEffect(() => {
    setIsExpanded(false);
  }, [safeIndex, currentFriend?.id]);

  // Hero photos (strictly distinct up to 2, resolved via resolveImageUrl)
  const heroPhotos: string[] = useMemo(() => {
    if (!currentFriend) return [];
    const sourcePhotos =
      (currentFriend.heroPhotos && currentFriend.heroPhotos.length > 0)
        ? currentFriend.heroPhotos
        : (currentFriend.photos && currentFriend.photos.length > 0)
        ? currentFriend.photos
        : [currentFriend.avatar];
    const urls = sourcePhotos.map((p) => resolveImageUrl(p)).filter(Boolean);
    const unique = urls.filter((p, i, a) => a.indexOf(p) === i);
    return unique.slice(0, 2);
  }, [currentFriend]);

  // Dual-photo transition (every 2 seconds)
  useEffect(() => {
    setPhotoIndex(0);
    if (heroPhotos.length <= 1) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [heroPhotos]);

  // Smooth scroll dock so selected friend is in center
  const scrollToFriend = useCallback((idx: number, smooth: boolean = true) => {
    const dock = dockRef.current;
    if (!dock || !dock.children[idx]) return;
    const targetElement = dock.children[idx] as HTMLElement;
    const scrollTarget = targetElement.offsetLeft + targetElement.offsetWidth / 2 - dock.clientWidth / 2;
    dock.scrollTo({
      left: scrollTarget,
      behavior: smooth ? 'smooth' : 'auto',
    });
  }, []);

  // Update 3D arc transform on scroll
  const handleDockScroll = useCallback(() => {
    const dock = dockRef.current;
    if (!dock || friends.length === 0) return;
    const mid = dock.scrollLeft + dock.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < dock.children.length; i++) {
      const child = dock.children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const s = childCenter - mid;
      const d = Math.abs(s);
      if (d < minDistance) {
        minDistance = d;
        closestIndex = i;
      }
      // 3D Arc calculation
      const translateY = Math.min((d * d) / 1500, 36);
      const translateZ = -Math.min(d * 0.45, 100);
      const rotateY = Math.max(-42, Math.min(42, -s / 4));
      const scale = Math.max(0.78, 1.45 - d / 150);
      const brightness = d < 30 ? 1 : Math.max(0.45, 0.95 - d / 220);
      child.style.transform = `translateY(${translateY}px) translateZ(${translateZ}px) rotateY(${rotateY}deg) scale(${scale})`;
      child.style.filter = d < 30 ? 'none' : `brightness(${brightness})`;
    }

    if (closestIndex !== safeIndex && closestIndex < friends.length) {
      try {
        if (navigator.vibrate) navigator.vibrate(8);
      } catch (e) {
        // ignore
      }
      onSelectIndex(closestIndex);
    }
  }, [friends.length, safeIndex, onSelectIndex]);

  // Initial scroll alignment on open
  useEffect(() => {
    scrollToFriend(safeIndex, false);
    handleDockScroll();
  }, [category, safeIndex, scrollToFriend, handleDockScroll]);

  // Handle hero circle click with 3D spin then open profile
  const handleHeroClick = () => {
    if (!currentFriend || isSpinning) return;
    setIsSpinning(true);
    setTimeout(() => {
      setIsSpinning(false);
      onOpenProfile(currentFriend.id);
    }, 380);
  };

  const heroSize = isSquad ? 220 : 190;

  // Ordered info fields: Username, Bio, then others
  const allInfoFields: [string, string][] = useMemo(() => {
    if (!currentFriend) return [];
    const fields: [string, string | null | undefined][] = [
      ['Username', currentFriend.username || currentFriend.user],
      ['Bio', currentFriend.bio],
      ['Free Fire UID', currentFriend.ffUid],
      ['Gaming Role', currentFriend.role],
      ['DOB', currentFriend.dob],
      ['Status', currentFriend.online === true ? 'Online' : null],
    ];
    return fields.filter(([, val]) => val != null && val.trim() !== '') as [string, string][];
  }, [currentFriend]);

  const initialFields = allInfoFields.slice(0, 2);
  const remainingFields = allInfoFields.slice(2);
  const validLinks = currentFriend
    ? (currentFriend.links || []).filter((l) => l && /^https:\/\//.test(l.url || ''))
    : [];

  // Show "View more" button ONLY if there are additional fields or links
  const hasMoreContent = remainingFields.length > 0 || validLinks.length > 0;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${catMeta.label} Category`}
      className={`
        fixed inset-0 z-40 flex flex-col justify-between
        h-[100dvh] overflow-hidden select-none
        bg-radial-[ellipse_90%_60%_at_50%_0%] from-[#1a1440] via-[#0a0d14] to-[#0a0d14]
        animate-cat-in ${isSquad ? 'sweep-overlay-squad' : 'sweep-overlay'}
      `}
      style={{
        paddingTop: 'env(safe-area-inset-top, 0px)',
      }}
    >
      {/* 1. TOP HEADER BAR: "← वापस" + Category Name */}
      <header className="flex-none flex items-center justify-between px-4 py-3 z-30 bg-[#0a0d14]/75 backdrop-blur-md border-b border-[#1f2b46]/40">
        <div className="flex items-center gap-3">
          <button
            onClick={onClose}
            aria-label="वापस All Friends पर जाएँ"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-full border border-[#1f2b46] bg-[#111726] text-[#00f2fe] hover:bg-[#161f33] hover:border-[#00f2fe] cursor-pointer transition-all min-h-[44px]"
          >
            <span className="text-base">←</span>
            <span className="font-semibold text-xs tracking-wide">वापस</span>
          </button>
          <div className="flex items-center gap-2">
            <span className="text-lg">{catMeta.emoji}</span>
            <b
              className={`
                tracking-[0.2em] font-extrabold text-sm sm:text-base uppercase
                ${isSquad ? 'text-[#ffb53d] text-glow-gold' : 'text-[#00f2fe] text-glow-cyan'}
              `}
            >
              {catMeta.label}
            </b>
          </div>
        </div>
        {friends.length > 0 && (
          <span className="text-xs text-[#8fa3bf] font-medium font-mono">
            {safeIndex + 1} / {friends.length}
          </span>
        )}
      </header>

      {/* 2. MIDDLE SCROLLABLE CONTAINER: Big Hero Circle & Collapsible Info */}
      <div className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain px-3 py-4 flex flex-col items-center">
        {friends.length === 0 ? (
          <div className="my-auto text-center py-16 px-6 rounded-2xl border border-dashed border-[#1f2b46] bg-[#111726]/40 text-[#8fa3bf] max-w-md mx-auto">
            <p className="text-base font-medium">
              {category === 'online'
                ? 'कोई ऑनलाइन दोस्त नहीं है (Real online status आने पर यहाँ दिखेंगे)'
                : 'इस श्रेणी में कोई दोस्त नहीं है'}
            </p>
          </div>
        ) : (
          <div className="w-full max-w-md mx-auto flex flex-col items-center text-center my-auto py-2">
            {/* Big Hero Circle with 3 Rings + 3D Spin */}
            <div
              ref={heroRef}
              role="button"
              tabIndex={0}
              aria-label={`${currentFriend.name} का Profile देखें`}
              onClick={handleHeroClick}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') handleHeroClick();
              }}
              className={`
                hero relative cursor-pointer group flex items-center justify-center
                rounded-full transition-transform duration-300 my-4
                ${isSpinning ? 'animate-spin-3d' : 'hover:scale-102'}
              `}
              style={{ width: `${heroSize}px`, height: `${heroSize}px` }}
            >
              {/* 3D WebGL Holographic Ring Canvas */}
              <HoloRing3D
                isSquad={isSquad}
                size={heroSize}
                fxLevel={fxLevel}
              />

              {/* Glowing Outer Border */}
              <div
                className={`
                  absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-300
                  ${
                    isSquad
                      ? 'border-[#ffb53d] glow-gold-intense shadow-[0_0_50px_rgba(255,181,61,0.5)]'
                      : 'border-[#00f2fe] glow-cyan-intense shadow-[0_0_40px_rgba(0,242,254,0.45)]'
                  }
                `}
              />

              {/* Photos with smooth 3D Flip */}
              <div className="relative w-full h-full rounded-full overflow-hidden p-1.5 bg-[#0a0d14]">
                {heroPhotos.map((photo, i) => {
                  const isActive = i === photoIndex;
                  return (
                    <img
                      key={`${photo}-${i}`}
                      src={photo}
                      alt={currentFriend.name}
                      className={`
                        absolute inset-1.5 w-[calc(100%-12px)] h-[calc(100%-12px)] rounded-full object-cover
                        transition-all duration-700 ease-in-out
                        ${
                          isActive
                            ? 'opacity-100 scale-100 filter brightness-100'
                            : 'opacity-0 scale-95 pointer-events-none'
                        }
                      `}
                      style={{
                        objectPosition: 'center 25%',
                      }}
                    />
                  );
                })}
              </div>

              {/* Holographic Shimmer reflection overlay */}
              <div
                className="absolute inset-0 rounded-full pointer-events-none mix-blend-screen opacity-50 bg-gradient-to-tr from-transparent via-white/20 to-transparent"
              />

              {/* Tap to open badge on hover */}
              <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                <span className="text-xs text-[#00f2fe] font-semibold bg-[#0a0d14]/85 px-3 py-1 rounded-full border border-[#00f2fe]/40">
                  Profile खोलें
                </span>
              </div>
            </div>

            {/* Friend Details Under Big Circle (View more / View less) */}
            <div className="info flex flex-col items-center mt-1 px-4 min-h-[90px] w-full">
              <div className="flex items-center justify-center gap-2">
                <h2
                  className={`
                    text-xl sm:text-2xl font-bold tracking-wide
                    ${isSquad ? 'text-[#ffb53d] text-glow-gold' : 'text-[#e8f4ff] text-glow-cyan'}
                  `}
                >
                  {currentFriend.name}
                </h2>
                {currentFriend.isDemo && (
                  <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#1f2b46] text-[#8fa3bf]">
                    Demo
                  </span>
                )}
              </div>

              {/* Initial Fields: At most 2 filled fields (Bio clamped to max 2 lines) */}
              <div className="flex flex-col items-center gap-1 mt-1 text-sm text-[#8fa3bf] w-full">
                {initialFields.map(([label, val]) => (
                  <p key={label} className="text-center line-clamp-2 max-w-sm">
                    <span className="text-[#8fa3bf]/70 text-xs">{label}: </span>
                    <span className="text-[#e8f4ff] font-medium">{val}</span>
                  </p>
                ))}
              </div>

              {/* Expandable Section (Smooth transition) */}
              {hasMoreContent && (
                <div
                  className={`
                    w-full flex flex-col items-center overflow-hidden transition-all duration-300 ease-in-out
                    ${isExpanded ? 'max-h-96 opacity-100 mt-2' : 'max-h-0 opacity-0'}
                  `}
                >
                  {remainingFields.map(([label, val]) => (
                    <p key={label} className="text-center text-sm text-[#8fa3bf] max-w-sm my-0.5">
                      <span className="text-[#8fa3bf]/70 text-xs">{label}: </span>
                      <span className="text-[#e8f4ff] font-medium">{val}</span>
                    </p>
                  ))}

                  {/* Social Links if present */}
                  {validLinks.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-2 mt-2">
                      {validLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs text-[#00f2fe] hover:text-[#e8f4ff] border border-[#00f2fe]/60 bg-[#111726]/60 rounded-full px-3 py-1 transition-colors"
                        >
                          {link.label} ↗
                        </a>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* View More / View Less Button */}
              {hasMoreContent && (
                <button
                  type="button"
                  aria-expanded={isExpanded}
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="vm text-xs font-semibold text-[#ffb53d] hover:text-[#ffd580] py-2 px-3 cursor-pointer transition-colors min-h-[44px] flex items-center justify-center"
                >
                  {isExpanded ? 'View less ▲' : 'View more ▼'}
                </button>
              )}

              {/* Action Button: View Profile + Gallery */}
              <div className="mt-2">
                <button
                  onClick={handleHeroClick}
                  className={`
                    px-6 py-2 rounded-full font-semibold text-sm cursor-pointer
                    transition-all duration-300 min-h-[44px] flex items-center justify-center gap-2
                    ${
                      isSquad
                        ? 'border border-[#ffb53d] text-[#ffb53d] hover:bg-[#ffb53d]/15 glow-gold'
                        : 'border border-[#00f2fe] text-[#00f2fe] hover:bg-[#00f2fe]/15 glow-cyan'
                    }
                  `}
                >
                  <span>पूरा Profile + Gallery देखें</span>
                  <span>→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 3. BOTTOM FIXED CURVED DOCK: Stays anchored on screen, no page scrolling needed! */}
      {friends.length > 0 && (
        <div
          className="flex-none relative w-full overflow-hidden bg-[#0a0d14]/80 backdrop-blur-md border-t border-[#1f2b46]/30 z-20"
          style={{
            paddingBottom: 'calc(24px + env(safe-area-inset-bottom, 0px))',
          }}
        >
          <div
            ref={dockRef}
            onScroll={handleDockScroll}
            className="dock perspective-stage flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x pt-3 pb-2"
            style={{
              paddingLeft: 'calc(50% - 36px)',
              paddingRight: 'calc(50% - 36px)',
              scrollSnapType: 'x mandatory',
            }}
            aria-label="मित्र डॉक, दाएँ-बाएँ स्वाइप करें"
          >
            {friends.map((friend, index) => {
              const isCurrent = index === safeIndex;
              const avatarUrl = resolveImageUrl(friend.avatar);
              return (
                <button
                  key={friend.id}
                  data-index={index}
                  aria-label={friend.name}
                  aria-selected={isCurrent}
                  onClick={() => {
                    if (index === safeIndex) {
                      handleHeroClick();
                    } else {
                      scrollToFriend(index, true);
                    }
                  }}
                  className={`
                    av relative flex-shrink-0 w-[72px] h-[72px] rounded-full p-0.5
                    cursor-pointer transition-all duration-150 ease-out select-none
                    border-2 bg-[#111726] overflow-hidden
                    ${
                      isCurrent
                        ? isSquad
                          ? 'border-[#ffb53d] glow-gold shadow-[0_0_20px_#ffb53d]'
                          : 'border-[#00f2fe] glow-cyan shadow-[0_0_20px_#00f2fe]'
                        : 'border-[#1f2b46]'
                    }
                  `}
                  style={{
                    scrollSnapAlign: 'center',
                  }}
                >
                  <img
                    src={avatarUrl}
                    alt={friend.name}
                    className="w-full h-full rounded-full object-cover pointer-events-none"
                  />
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
