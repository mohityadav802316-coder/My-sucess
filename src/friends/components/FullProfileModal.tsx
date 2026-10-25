import React, { useEffect, useState, useMemo } from 'react';
import { Friend, resolveImageUrl } from '../data/friends';
import { HoloRing3D } from './HoloRing3D';
import { useFriendsConfig } from '../data/repository';
import { Share2, Check, ArrowLeft } from 'lucide-react';

interface FullProfileModalProps {
  friend: Friend | null;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string) => void;
  fxLevel?: 'high' | 'low' | 'minimal';
}

export const FullProfileModal: React.FC<FullProfileModalProps> = ({
  friend,
  onClose,
  onOpenLightbox,
  fxLevel = 'high',
}) => {
  const [photoIndex, setPhotoIndex] = useState(0);
  const [copiedLink, setCopiedLink] = useState(false);
  const { settings } = useFriendsConfig();

  // Filter distinct hero photos (up to 2) using resolveImageUrl
  const heroPhotos = useMemo(() => {
    if (!friend) return [];
    const source = (friend.heroPhotos && friend.heroPhotos.length > 0)
      ? friend.heroPhotos
      : (friend.photos && friend.photos.length > 0)
      ? friend.photos
      : [friend.avatar];
    const urls = source.map((p) => resolveImageUrl(p)).filter(Boolean);
    const unique = urls.filter((p, i, a) => a.indexOf(p) === i);
    return unique.slice(0, 2);
  }, [friend]);

  // Dual photo flip timer (2 seconds)
  useEffect(() => {
    setPhotoIndex(0);
    if (!friend || heroPhotos.length <= 1) return;
    const timer = setInterval(() => {
      if (document.hidden) return;
      setPhotoIndex((prev) => (prev + 1) % heroPhotos.length);
    }, 2000);
    return () => clearInterval(timer);
  }, [friend, heroPhotos]);

  // Trap escape key to close
  useEffect(() => {
    if (!friend) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [friend, onClose]);

  // Format DOB with or without year
  const formattedDob = useMemo(() => {
    if (!friend || !friend.dob) return null;
    if (friend.dobShowYear === false) {
      // Attempt to strip year e.g. "2005-08-15" -> "15 August" or "15/08/2005" -> "15/08"
      const parts = friend.dob.split(/[-/]/);
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}`;
        }
        return `${parts[0]}-${parts[1]}`;
      }
    }
    return friend.dob;
  }, [friend?.dob, friend?.dobShowYear]);

  const handleShare = async () => {
    if (!friend) return;
    const shareUrl = `${window.location.origin}${window.location.pathname}?friend=${friend.id}`;
    const shareTitle = `${friend.name} - Friends Universe`;
    const shareText = `Check out ${friend.name} on Friends Universe 3D!`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch (err) {
        // User cancelled or unsupported, fallback to copy
      }
    }

    // Clipboard fallback
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch (e) {
      // ignore
    }
  };

  if (!friend) return null;

  const isSquad = (friend.cats || friend.categories || []).includes('squad');
  const accentColor = friend.accent || (isSquad ? '#FFB53D' : '#00F2FE');

  // Category labels mapping from dynamic settings
  const categoryLabels = (friend.cats || friend.categories || [])
    .map((c) => {
      const match = settings.categories.find((cat) => cat.key === c);
      return match ? match.label : c;
    })
    .join(', ');

  // Information card rows (strictly filled fields only!)
  const infoRows: [string, string | null | undefined][] = [
    ['Full Name', friend.fullName],
    ['Display Name', friend.name],
    ['Nickname', friend.nickname],
    ['Username', friend.username || friend.user],
    ['Date of Birth', formattedDob],
    ['Bio', friend.bio],
    ['Category', categoryLabels || null],
    ['Online', friend.online === true ? 'Online' : friend.online === false ? 'Offline' : null],
    ['Free Fire Name', friend.ffName],
    ['Free Fire UID', friend.ffUid],
    ['Gaming Role', friend.role],
  ].filter(([, val]) => val != null && val !== '') as [string, string][];

  // Verified https social links
  const validLinks = (friend.links || []).filter(
    (link) => link && link.visible !== false && /^https:\/\//.test(link.url || '')
  );

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${friend.name} Profile`}
      className="fixed inset-0 z-50 overflow-y-auto bg-[#0a0d14]/95 backdrop-blur-md flex flex-col p-4 sm:p-6"
    >
      <div className="w-full max-w-2xl mx-auto flex flex-col pb-16">
        {/* Top Back Navigation Bar & Share */}
        <div className="flex items-center justify-between mb-4 sticky top-0 z-10 py-2 bg-[#0a0d14]/80 backdrop-blur-sm">
          <button
            onClick={onClose}
            aria-label="वापस जाएँ"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#1f2b46] bg-[#111726] text-[#00f2fe] hover:bg-[#161f33] hover:border-[#00f2fe] cursor-pointer transition-all min-h-[44px]"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="font-semibold text-sm">वापस</span>
          </button>

          <div className="flex items-center gap-2">
            {settings.features.shareButton && (
              <button
                onClick={handleShare}
                aria-label="दोस्त का प्रोफाइल शेयर करें"
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full border border-[#1f2b46] bg-[#111726] text-[#e8f4ff] hover:border-[#00f2fe] hover:text-[#00f2fe] cursor-pointer transition-all text-xs font-semibold min-h-[44px]"
              >
                {copiedLink ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[#3dff9a]" />
                    <span className="text-[#3dff9a]">Link Copied!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-3.5 h-3.5" />
                    <span>Share</span>
                  </>
                )}
              </button>
            )}

            {friend.isDemo && (
              <span className="text-xs uppercase font-bold tracking-wider px-2.5 py-1 rounded bg-[#1f2b46] text-[#8fa3bf]">
                Demo Profile
              </span>
            )}
          </div>
        </div>

        {/* 3D Big Hero Circle Frame */}
        <div className="flex flex-col items-center my-3">
          <div
            className="relative flex items-center justify-center rounded-full"
            style={{ width: '220px', height: '220px' }}
          >
            <HoloRing3D
              isSquad={isSquad}
              size={220}
              fxLevel={fxLevel}
            />

            <div
              className="absolute inset-0 rounded-full border-2 pointer-events-none transition-all duration-300"
              style={{
                borderColor: accentColor,
                boxShadow: `0 0 35px ${accentColor}80`,
              }}
            />

            {/* Photos with smooth 3D Flip */}
            <div className="relative w-full h-full rounded-full overflow-hidden p-1.5 bg-[#0a0d14]">
              {heroPhotos.map((photo, i) => {
                const isActive = i === photoIndex;
                return (
                  <img
                    key={`${photo}-${i}`}
                    src={photo}
                    alt={friend.name}
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
          </div>

          <h2
            className="mt-4 text-2xl sm:text-3xl font-bold tracking-wide transition-all"
            style={{
              color: accentColor,
              textShadow: `0 0 16px ${accentColor}80`,
            }}
          >
            {friend.name}
          </h2>
          <p className="text-sm text-[#8fa3bf] mt-0.5">
            {friend.username || friend.user || (friend.nickname ? `(${friend.nickname})` : '')}
          </p>
        </div>

        {/* Section 1: Info Card (Only filled fields!) */}
        <div className="bg-[#111726]/85 border border-[#1f2b46] rounded-2xl p-4 sm:p-5 my-3 shadow-lg">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#ffb53d] mb-3 flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>INFO</span>
          </h3>
          <div className="divide-y divide-[#1f2b46]/70">
            {infoRows.map(([label, val]) => (
              <div
                key={label}
                className="py-2.5 flex items-start justify-between gap-4 text-sm flex-wrap sm:flex-nowrap"
              >
                <span className="text-[#8fa3bf] font-medium flex-shrink-0">{label}</span>
                <span className="text-[#e8f4ff] font-semibold text-right break-words max-w-full sm:max-w-xs">
                  {val}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Section 2: Social Links */}
        <div className="bg-[#111726]/85 border border-[#1f2b46] rounded-2xl p-4 sm:p-5 my-3 shadow-lg">
          <h3 className="text-xs uppercase tracking-widest font-bold text-[#ffb53d] mb-3 flex items-center gap-1.5">
            <span>🔗</span>
            <span>SOCIAL LINKS</span>
          </h3>
          {validLinks.length > 0 ? (
            <div className="flex flex-wrap gap-2.5">
              {validLinks.map((link, idx) => (
                <a
                  key={idx}
                  href={link.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm border bg-[#161f33] rounded-full px-4 py-2 transition-colors min-h-[44px]"
                  style={{
                    borderColor: `${accentColor}80`,
                    color: accentColor,
                  }}
                >
                  <span>{link.label}</span>
                  <span className="text-xs">↗</span>
                </a>
              ))}
            </div>
          ) : (
            <p className="text-sm text-[#8fa3bf]">कोई सोशल लिंक नहीं जुड़ा है</p>
          )}
        </div>

        {/* Section 3: Photo Gallery */}
        {settings.features.gallery && (
          <div className="bg-[#111726]/85 border border-[#1f2b46] rounded-2xl p-4 sm:p-5 my-3 shadow-lg">
            <h3 className="text-xs uppercase tracking-widest font-bold text-[#ffb53d] mb-3 flex items-center gap-1.5">
              <span>📷</span>
              <span>GALLERY</span>
            </h3>
            {friend.gallery && friend.gallery.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {friend.gallery.map((imgItem, idx) => {
                  const resolvedUrl = resolveImageUrl(imgItem);
                  return (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => onOpenLightbox(resolvedUrl)}
                      aria-label="फोटो बड़ा करके देखें"
                      className="group relative aspect-square rounded-xl overflow-hidden border border-[#1f2b46] hover:border-[#00f2fe] cursor-pointer transition-all bg-[#0a0d14]"
                    >
                      <img
                        src={resolvedUrl}
                        alt={`Gallery ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-xs text-[#00f2fe] font-semibold bg-[#0a0d14]/80 px-2.5 py-1 rounded-full border border-[#00f2fe]/40">
                          Zoom 🔍
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <p className="text-sm text-[#8fa3bf]">कोई गैलरी फोटो उपलब्ध नहीं है</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
