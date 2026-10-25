import React, { useEffect, useRef, useState, useCallback, useMemo } from 'react';
import { Friend, CategoryKey, resolveImageUrl } from '../data/friends';
import { HoloRing3D } from './HoloRing3D';

interface CurvedDockProps {
  category: CategoryKey;
  friends: Friend[];
  selectedIndex: number;
  onSelectIndex: (index: number) => void;
  onOpenProfile: (id: string) => void;
  fxLevel?: 'high' | 'low' | 'minimal';
}

export const CurvedDock: React.FC<CurvedDockProps> = ({
  category,
  friends,
  selectedIndex,
  onSelectIndex,
  onOpenProfile,
  fxLevel = 'high',
}) => {
  const dockRef = useRef<HTMLDivElement>(null);
  const isSquad = category === 'squad';

  // State to track dual-photo flip (0 or 1)
  const [photoIndex, setPhotoIndex] = useState(0);

  // Big circle dimensions
  const heroSize = isSquad ? 220 : 190;

  // Selected friend safely bound
  const safeIndex = friends.length > 0 ? Math.min(Math.max(0, selectedIndex), friends.length - 1) : 0;
  const currentFriend = friends[safeIndex];

  // Distinct hero photos (max 2) resolved to strings
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

  // Dual-photo transition interval (2 seconds)
  useEffect(() => {
    setPhotoIndex(0);
    if (heroPhotos.length <= 1) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [heroPhotos]);

  // Scroll dock to ensure selected index is at center
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

  // Update styles and compute closest center friend on dock scroll
  const handleDockScroll = useCallback(() => {
    const dock = dockRef.current;
    if (!dock || friends.length === 0) return;
    const mid = dock.scrollLeft + dock.clientWidth / 2;
    let closestIndex = 0;
    let minDistance = Infinity;

    for (let i = 0; i < dock.children.length; i++) {
      const child = dock.children[i] as HTMLElement;
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const distance = Math.abs(childCenter - mid);
      if (distance < minDistance) {
        minDistance = distance;
        closestIndex = i;
      }
      // Curved Arc transform: distance squared creates a smooth parabolic bow/curve
      const translateY = Math.min((distance * distance) / 1500, 36);
      const scale = Math.max(0.78, 1.45 - distance / 150);
      const brightness = distance < 32 ? 1 : Math.max(0.45, 0.95 - distance / 220);
      child.style.transform = `translateY(${translateY}px) scale(${scale})`;
      child.style.filter = `brightness(${brightness})`;
    }

    if (closestIndex !== safeIndex && closestIndex < friends.length) {
      onSelectIndex(closestIndex);
    }
  }, [friends.length, safeIndex, onSelectIndex]);

  // Initial scroll position alignment
  useEffect(() => {
    scrollToFriend(safeIndex, false);
    handleDockScroll();
  }, [category, safeIndex, scrollToFriend, handleDockScroll]);

  if (!friends || friends.length === 0) {
    return (
      <div className="text-center py-16 px-6 rounded-2xl border border-dashed border-[#1f2b46] bg-[#111726]/40 text-[#8fa3bf] my-8 max-w-md mx-auto">
        <p className="text-base font-medium">
          {category === 'online'
            ? 'कोई ऑनलाइन दोस्त नहीं है (Real online status आने पर यहाँ दिखेंगे)'
            : 'इस श्रेणी में कोई दोस्त नहीं है'}
        </p>
      </div>
    );
  }

  // Active friend info fields (ONLY show filled non-empty values!)
  const infoFields: [string, string | null | undefined][] = [
    ['Username', currentFriend.username || currentFriend.user],
    ['Bio', currentFriend.bio],
    ['Free Fire UID', currentFriend.ffUid],
    ['Gaming Role', currentFriend.role],
    ['DOB', currentFriend.dob],
    ['Status', currentFriend.online === true ? 'Online' : null],
  ].filter(([, val]) => val != null && val !== '') as [string, string][];

  // Verified https social links
  const validLinks = (currentFriend.links || []).filter(
    (link) => link && /^https:\/\//.test(link.url || '')
  );

  return (
    <div className="flex flex-col items-center w-full my-1 select-none">
      {/* 1. TOP: BIG CIRCLE (~190px or 220px in SQUAD) + 3D HOLOGRAPHIC RING */}
      <div className="flex flex-col items-center text-center w-full max-w-lg mx-auto">
        <div
          role="button"
          tabIndex={0}
          aria-label={`${currentFriend.name} का Profile खोलें`}
          onClick={() => onOpenProfile(currentFriend.id)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              onOpenProfile(currentFriend.id);
            }
          }}
          className={`
            relative cursor-pointer group my-3 flex items-center justify-center
            rounded-full transition-transform duration-300 hover:scale-102
          `}
          style={{ width: `${heroSize}px`, height: `${heroSize}px` }}
        >
          {/* 3D WebGL Holographic Ring Canvas */}
          <HoloRing3D
            isSquad={isSquad}
            size={heroSize}
            fxLevel={fxLevel}
          />

          {/* Glowing Outer Border Glow Indicator */}
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

          {/* Hero Photos with smooth 3D Flip / Fade */}
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
                        ? 'opacity-100 scale-100 rotate-y-0 filter brightness-100'
                        : 'opacity-0 scale-95 rotate-y-90 pointer-events-none'
                    }
                  `}
                  style={{
                    objectPosition: 'center 25%',
                    backfaceVisibility: 'hidden',
                  }}
                />
              );
            })}
          </div>

          {/* Tap Prompt Overlay hint on hover */}
          <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
            <span className="text-xs text-[#00f2fe] font-semibold tracking-wider bg-[#0a0d14]/80 px-2.5 py-1 rounded-full border border-[#00f2fe]/40">
              Profile देखें
            </span>
          </div>
        </div>

        {/* Friend Details Under Big Circle */}
        <div className="flex flex-col items-center mt-1 px-4 min-h-[90px] w-full">
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

          {/* Filled Attributes List */}
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 mt-1 text-sm text-[#8fa3bf]">
            {infoFields.map(([label, val]) => (
              <span key={label} className="inline-flex items-center gap-1">
                <span className="text-[#8fa3bf]/70 text-xs">{label}:</span>
                <span className="text-[#e8f4ff] font-medium">{val}</span>
              </span>
            ))}
          </div>

          {/* Social Links if present */}
          {validLinks.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2 mt-2.5">
              {validLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-[#00f2fe] hover:text-[#e8f4ff] border border-[#00f2fe]/60 hover:border-[#00f2fe] bg-[#111726]/60 rounded-full px-3 py-1 transition-colors"
                >
                  {link.label} ↗
                </a>
              ))}
            </div>
          )}

          {/* Action Button: View Profile + Gallery */}
          <button
            onClick={() => onOpenProfile(currentFriend.id)}
            className={`
              mt-3 px-6 py-2 rounded-full font-semibold text-sm cursor-pointer
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

      {/* 2. BOTTOM: CURVED DOCK (~72px Avatars, horizontal snapping scroll) */}
      <div className="relative w-full overflow-hidden mt-2">
        <div
          ref={dockRef}
          onScroll={handleDockScroll}
          className="dock flex items-center gap-4 overflow-x-auto no-scrollbar scroll-smooth touch-pan-x py-8"
          style={{
            paddingLeft: 'calc(50% - 36px)',
            paddingRight: 'calc(50% - 36px)',
            scrollSnapType: 'x mandatory',
          }}
          aria-label="मित्र डॉक, दाएँ-बाएँ स्वाइप करें"
        >
          {friends.map((friend, index) => {
            const isCurrent = index === safeIndex;
            return (
              <button
                key={friend.id}
                data-index={index}
                aria-label={friend.name}
                aria-selected={isCurrent}
                onClick={() => {
                  if (index === safeIndex) {
                    onOpenProfile(friend.id);
                  } else {
                    scrollToFriend(index, true);
                  }
                }}
                className={`
                  relative flex-shrink-0 w-[72px] h-[72px] rounded-full p-0.5
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
                  src={resolveImageUrl(friend.avatar)}
                  alt={friend.name}
                  className="w-full h-full rounded-full object-cover pointer-events-none"
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};
