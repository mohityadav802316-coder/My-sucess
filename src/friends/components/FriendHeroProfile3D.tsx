import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, resolveImageUrl } from '../data/friends';
import { FloatingPhoneHero3D } from '../../components/three/FloatingPhoneHero3D';
import { PhotoOrbitHero3D } from '../../components/three/PhotoOrbitHero3D';
import { sound } from '../../components/audio/SoundEffects';
import { PortfolioImage } from '../../types';
import { getSocialBrandMeta } from '../utils/socialUtils';
import {
  ArrowLeft,
  Share2,
  Check,
  X,
  Smartphone,
  Compass,
  MessageCircle,
  Sparkles,
  ExternalLink,
  Flame,
  Calendar,
  Camera,
  Images,
} from 'lucide-react';

interface FriendHeroProfile3DProps {
  friend: Friend;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string) => void;
  fxLevel?: 'high' | 'low' | 'minimal';
}

const getCleanWhatsappUrl = (raw: string | null | undefined, friendName = '') => {
  if (!raw || !raw.trim()) return null;
  const trimmed = raw.trim();
  if (trimmed.startsWith('https://wa.me/') || trimmed.startsWith('http://wa.me/')) {
    return trimmed;
  }
  const digits = trimmed.replace(/\D/g, '');
  if (!digits) return null;
  const fullNum = digits.length === 10 ? `91${digits}` : digits;
  const msg = encodeURIComponent(`Hi ${friendName}, I saw your 3D profile on Mohit Yadav's Friends Universe!`);
  return `https://wa.me/${fullNum}?text=${msg}`;
};

export const FriendHeroProfile3D: React.FC<FriendHeroProfile3DProps> = ({
  friend,
  onClose,
  onOpenLightbox,
  fxLevel = 'high',
}) => {
  const [view3DMode, setView3DMode] = useState<'phone' | 'orbit'>('phone');
  const [copiedLink, setCopiedLink] = useState(false);

  const isSquadMember = (friend.cats || friend.categories || []).includes('squad');
  const accentColor = friend.accent || (isSquadMember ? '#FFB53D' : '#00F2FE');

  const whatsappUrl = useMemo(() => {
    return getCleanWhatsappUrl(friend.whatsapp, friend.name);
  }, [friend.whatsapp, friend.name]);

  // Clean social links mapping from admin-managed friend.links
  const validLinks = useMemo(() => {
    return (friend.links || []).filter((l) => l && l.url && l.visible !== false);
  }, [friend.links]);

  // Format DOB with or without year
  const formattedDob = useMemo(() => {
    if (!friend || !friend.dob) return null;
    if (friend.dobShowYear === false) {
      const parts = friend.dob.split(/[-/]/);
      if (parts.length >= 3) {
        if (parts[0].length === 4) {
          return `${parts[2]}-${parts[1]}`;
        }
        return `${parts[0]}-${parts[1]}`;
      }
    }
    return friend.dob;
  }, [friend.dob, friend.dobShowYear]);

  // Collect all photos from admin panel (gallery, photos, heroPhotos, avatar)
  const allGalleryPhotos = useMemo(() => {
    const list: string[] = [];

    // 1. Dedicated Gallery Photos
    if (friend.gallery && Array.isArray(friend.gallery)) {
      friend.gallery.forEach((p) => {
        const u = resolveImageUrl(p);
        if (u && !list.includes(u)) list.push(u);
      });
    }

    // 2. Photos / Additional Photos
    if (friend.photos && Array.isArray(friend.photos)) {
      friend.photos.forEach((p) => {
        const u = resolveImageUrl(p);
        if (u && !list.includes(u)) list.push(u);
      });
    }

    // 3. Hero Photos
    if (friend.heroPhotos && Array.isArray(friend.heroPhotos)) {
      friend.heroPhotos.forEach((p) => {
        const u = resolveImageUrl(p);
        if (u && !list.includes(u)) list.push(u);
      });
    }

    // 4. Primary Avatar
    const avatarUrl = resolveImageUrl(friend.avatar);
    if (avatarUrl && !list.includes(avatarUrl)) {
      list.unshift(avatarUrl);
    }

    return list;
  }, [friend.gallery, friend.photos, friend.heroPhotos, friend.avatar]);

  // Adapt friend's photo to PortfolioImage central item
  const centralPhoto: PortfolioImage = useMemo(() => {
    return {
      id: `friend-${friend.id}-central`,
      downloadUrl: resolveImageUrl(friend.avatar),
      caption: friend.name,
      captionHi: friend.nickname || friend.name,
      section: 'profile',
      category: 'personal',
      displayOrder: 0,
      isPublished: true,
      isMainProfile: true,
      isHeroOrbit: true,
      storagePath: 'friends',
      createdAt: null,
    };
  }, [friend.id, friend.avatar, friend.name, friend.nickname]);

  // Adapt friend's gallery/photos to PortfolioImage orbit items
  const orbitPhotos: PortfolioImage[] = useMemo(() => {
    const rawList =
      friend.photos && friend.photos.length > 0
        ? friend.photos
        : friend.heroPhotos && friend.heroPhotos.length > 0
        ? friend.heroPhotos
        : [friend.avatar];

    const uniqueUrls = rawList.map((p) => resolveImageUrl(p)).filter(Boolean);

    // Ensure at least 3 cards so the 3D orbit looks full and balanced
    const expanded =
      uniqueUrls.length === 1
        ? [uniqueUrls[0], uniqueUrls[0], uniqueUrls[0]]
        : uniqueUrls.length === 2
        ? [...uniqueUrls, uniqueUrls[0]]
        : uniqueUrls;

    return expanded.map((url, idx) => ({
      id: `friend-${friend.id}-orbit-${idx}`,
      downloadUrl: url,
      caption: `${friend.name} #${idx + 1}`,
      captionHi: `${friend.nickname || friend.name} #${idx + 1}`,
      section: 'gallery',
      category: 'personal',
      displayOrder: idx,
      isPublished: true,
      isMainProfile: false,
      isHeroOrbit: true,
      storagePath: 'friends',
      createdAt: null,
    }));
  }, [friend.id, friend.photos, friend.heroPhotos, friend.avatar, friend.name, friend.nickname]);

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  const handleShare = async () => {
    sound.playClick();
    const base = window.location.origin + window.location.pathname.replace(/\/+$/, '');
    const shareUrl = `${base}/?friend=${encodeURIComponent(friend.id)}`;
    const shareTitle = `${friend.name} - Friends Universe 3D`;
    const shareText = `Check out ${friend.name}'s 3D Profile on Mohit Yadav's Friends Universe! 🔥`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: shareText,
          url: shareUrl,
        });
        return;
      } catch {}
    }

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      window.prompt('Direct 3D Profile Link:', shareUrl);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="fixed inset-0 z-50 bg-[#070A10]/95 backdrop-blur-2xl flex flex-col overflow-y-auto select-none"
    >
      {/* Background Accent Atmospheric Glow */}
      <div
        className="fixed inset-0 pointer-events-none transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse 70% 50% at 75% 30%, ${accentColor}18 0%, transparent 70%)`,
        }}
      />

      {/* Top Bar Navigation (Clean, Accessible) */}
      <header className="sticky top-0 z-40 w-full flex items-center justify-between px-4 sm:px-8 py-3.5 bg-[#070A10]/80 backdrop-blur-xl border-b border-slate-800/80">
        <button
          type="button"
          onClick={() => {
            sound.playClick();
            onClose();
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-mono transition-all cursor-pointer active:scale-95 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-cyan-400" />
          <span>Friends Universe पर लौटें</span>
        </button>

        <div className="flex items-center gap-2">
          {/* Share Button */}
          <button
            type="button"
            onClick={handleShare}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer border shadow-sm ${
              copiedLink
                ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500/50'
                : 'bg-slate-900/90 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border-cyan-500/30 hover:border-cyan-400/50'
            }`}
            title="शेयर लिंक कॉपी करें"
          >
            {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Share2 className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{copiedLink ? 'लिंक कॉपी हो गया!' : 'शेयर करें'}</span>
          </button>

          {/* Close Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 rounded-xl bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 hover:border-rose-500/40 transition-all cursor-pointer"
            aria-label="Close Profile"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main 3D Hero Body (Modeled Exactly Like Mohit's Hero Section) */}
      <div className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex flex-col justify-center relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Cinematic Typography & Limited Admin Details */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 space-y-6 order-2 lg:order-1 text-left"
          >
            {/* Tag / Category Kicker */}
            <div className="flex items-center gap-2.5 text-xs font-mono tracking-wider">
              {isSquadMember ? (
                <span className="inline-flex items-center gap-1.5 text-amber-400 font-semibold drop-shadow-[0_0_8px_rgba(245,158,11,0.4)]">
                  <span>👑</span>
                  <span>MY SQUAD ELITE</span>
                </span>
              ) : (
                <span
                  className="inline-flex items-center gap-1.5 font-semibold"
                  style={{ color: accentColor }}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>3D DIGITAL FRIEND</span>
                </span>
              )}
              {friend.online && (
                <>
                  <span className="text-slate-600">·</span>
                  <span className="inline-flex items-center gap-1 text-[#3dff9a] font-semibold text-[11px]">
                    <span className="w-2 h-2 rounded-full bg-[#3dff9a] shadow-[0_0_8px_#3dff9a]" />
                    <span>ONLINE</span>
                  </span>
                </>
              )}
            </div>

            {/* Friend Name & Nickname in Large Cyberpunk Display Type */}
            <div className="space-y-2">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-cyber font-black tracking-tight text-white leading-[1.08] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
                <span
                  className="text-transparent bg-clip-text"
                  style={{
                    backgroundImage: `linear-gradient(135deg, #ffffff 30%, ${accentColor} 100%)`,
                  }}
                >
                  {friend.name}
                </span>
              </h1>

              {/* Subtitle / Nickname & Username */}
              <div className="flex items-center flex-wrap gap-2 text-sm sm:text-base font-mono text-slate-300">
                {friend.nickname && (
                  <span className="text-amber-300 font-medium">({friend.nickname})</span>
                )}
                <span className="text-slate-500">·</span>
                <span className="text-cyan-300">
                  {friend.username || friend.user || friend.role || 'Friends Universe Member'}
                </span>
              </div>
            </div>

            {/* Extra Info Pills: Free Fire UID & Birthday (Only if added in admin) */}
            {(friend.ffName || friend.ffUid || formattedDob) && (
              <div className="flex flex-wrap items-center gap-3 pt-1 text-xs font-mono text-slate-300">
                {(friend.ffName || friend.ffUid) && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-orange-950/40 border border-orange-500/40 text-orange-300">
                    <Flame className="w-3.5 h-3.5 text-orange-400" />
                    <span>FF: {friend.ffName || friend.ffUid}</span>
                  </div>
                )}
                {formattedDob && (
                  <div className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>जन्मदिन: {formattedDob}</span>
                  </div>
                )}
              </div>
            )}

            {/* Bio Narrative (From Admin Panel) */}
            {friend.bio && (
              <p className="text-sm sm:text-base text-slate-300/90 leading-relaxed font-sans max-w-xl">
                {friend.bio}
              </p>
            )}

            {/* Direct 1-Click WhatsApp Chat Button */}
            {whatsappUrl && (
              <div className="pt-2">
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => sound.playSuccess()}
                  className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-2xl bg-[#25D366] hover:bg-[#20ba5a] text-slate-950 font-bold font-mono text-sm shadow-[0_0_24px_rgba(37,211,102,0.45)] hover:shadow-[0_0_32px_rgba(37,211,102,0.7)] transition-all transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-5 h-5 fill-current" />
                  <span>सीधे WhatsApp पर चैट करें (1-Click)</span>
                </a>
              </div>
            )}

            {/* Rich Branded Social Links with Authentic Icons & 1-Click Direct Access */}
            {validLinks.length > 0 && (
              <div className="pt-3 border-t border-slate-800/80">
                <span className="block text-[11px] font-mono text-slate-400 mb-2.5 uppercase tracking-wider">
                  सोशल व कॉन्टैक्ट लिंक्स (1-Click Direct)
                </span>
                <div className="flex flex-wrap items-center gap-2.5">
                  {validLinks.map((link, idx) => {
                    const meta = getSocialBrandMeta(link);
                    if (!meta.url) return null;
                    return (
                      <a
                        key={link.id || idx}
                        href={meta.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl font-bold font-mono text-xs transition-all transform active:scale-95 cursor-pointer border ${meta.badgeClassName}`}
                        style={meta.badgeStyle}
                        title={`${friend.name} का ${meta.label} खोलें`}
                      >
                        {meta.icon}
                        <span>{meta.label}</span>
                        <ExternalLink className="w-3.5 h-3.5 opacity-60 ml-0.5" />
                      </a>
                    );
                  })}
                </div>
              </div>
            )}
          </motion.div>

          {/* Right Column: Floating 3D Showcase (Phone or Orbit Matrix) */}
          <motion.div
            initial={{ opacity: 0, scale: 0.94 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6 relative flex flex-col items-center order-1 lg:order-2 w-full"
          >
            {/* 3D View Mode Switcher (Phone View vs Photo Orbit) */}
            <div className="flex items-center gap-1.5 p-1 rounded-full bg-slate-900/90 border border-slate-700/80 mb-3 z-20 backdrop-blur-md shadow-lg">
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setView3DMode('phone');
                }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  view3DMode === 'phone'
                    ? 'text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  background:
                    view3DMode === 'phone'
                      ? `linear-gradient(135deg, ${accentColor}, #00f2fe)`
                      : undefined,
                }}
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>3D फोन व्यू (Phone 3D)</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  setView3DMode('orbit');
                }}
                className={`px-3.5 py-1.5 rounded-full text-[11px] font-mono transition-all cursor-pointer flex items-center gap-1.5 ${
                  view3DMode === 'orbit'
                    ? 'text-slate-950 font-bold shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
                style={{
                  background:
                    view3DMode === 'orbit'
                      ? `linear-gradient(135deg, ${accentColor}, #ffb53d)`
                      : undefined,
                }}
              >
                <Compass className="w-3.5 h-3.5" />
                <span>3D फोटो ऑर्बिट (Orbit 3D)</span>
              </button>
            </div>

            {/* 3D Canvas Container */}
            <div className="w-full relative min-h-[380px] sm:min-h-[460px] flex items-center justify-center">
              <AnimatePresence mode="wait">
                {view3DMode === 'phone' ? (
                  <motion.div
                    key="3d-phone"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full flex justify-center"
                  >
                    <FloatingPhoneHero3D
                      centralImage={centralPhoto}
                      orbitImages={orbitPhotos}
                      customName={friend.name}
                      customSubtitle={friend.username || friend.user || friend.role || 'Digital Friend'}
                      customHeaderTag={isSquadMember ? 'SQUAD ELITE' : 'DIGITAL FRIEND'}
                      customHeaderSub="FRIENDS UNIVERSE 3D"
                      customNote={
                        friend.bio
                          ? friend.bio.length > 55
                            ? friend.bio.slice(0, 52) + '...'
                            : friend.bio
                          : 'Friends Universe 3D Member'
                      }
                      metric1={{ label: isSquadMember ? 'SQUAD' : 'FRIEND', sub: 'Status' }}
                      metric2={{
                        label: formattedDob ? formattedDob.split('-')[0] || 'VERIFIED' : 'ACTIVE',
                        sub: 'Identity',
                      }}
                      metric3={{ label: friend.online ? 'ONLINE' : 'SECURE', sub: 'Signal' }}
                      onExplore={() => {
                        onOpenLightbox(resolveImageUrl(friend.avatar));
                      }}
                      isPaused={fxLevel === 'minimal'}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="3d-orbit"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.3 }}
                    className="w-full relative"
                  >
                    <PhotoOrbitHero3D
                      centralImage={centralPhoto}
                      orbitImages={orbitPhotos}
                      cycleInterval={2.5}
                      onSelectPhoto={(img) => {
                        onOpenLightbox(img.downloadUrl);
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </div>

        {/* Full Photo Gallery Section (All photos added in Admin Panel) */}
        {allGalleryPhotos.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.25 }}
            className="mt-10 sm:mt-14 pt-8 border-t border-slate-800/80 w-full"
          >
            <div className="flex items-center justify-between mb-4 sm:mb-6">
              <div className="flex items-center gap-2.5">
                <div
                  className="p-1.5 rounded-lg"
                  style={{ backgroundColor: `${accentColor}20`, color: accentColor }}
                >
                  <Images className="w-4 h-4" />
                </div>
                <h3 className="text-sm sm:text-base font-bold font-mono text-white tracking-wide uppercase">
                  फोटो गैलरी (Photo Gallery)
                </h3>
                <span
                  className="text-xs font-mono px-2.5 py-0.5 rounded-full border font-semibold"
                  style={{
                    backgroundColor: `${accentColor}15`,
                    borderColor: `${accentColor}40`,
                    color: accentColor,
                  }}
                >
                  {allGalleryPhotos.length} Photos
                </span>
              </div>
              <span className="text-[11px] font-mono text-slate-500 hidden sm:inline">
                फोटो पर क्लिक करके बड़ा देखें (Zoom)
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4">
              {allGalleryPhotos.map((photoUrl, idx) => (
                <button
                  key={`${photoUrl}-${idx}`}
                  type="button"
                  onClick={() => {
                    sound.playClick();
                    onOpenLightbox(photoUrl);
                  }}
                  className="group relative aspect-square rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 hover:border-cyan-400 transition-all cursor-pointer shadow-md hover:shadow-cyan-500/20 active:scale-95"
                >
                  <img
                    src={photoUrl}
                    alt={`${friend.name} Photo ${idx + 1}`}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-slate-950/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center p-2">
                    <span
                      className="text-[11px] font-mono font-bold px-3 py-1 rounded-full border shadow-lg backdrop-blur-md"
                      style={{
                        backgroundColor: '#0a0d14dd',
                        borderColor: `${accentColor}80`,
                        color: accentColor,
                      }}
                    >
                      Zoom 🔍
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};
