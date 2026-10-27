import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Friend, resolveImageUrl } from '../data/friends';
import { sound } from '../../components/audio/SoundEffects';
import { getSocialBrandMeta } from '../utils/socialUtils';
import {
  Home,
  Users,
  Plus,
  Share2,
  Link2,
  Check,
  X,
  User,
  Phone,
  Eye,
  EyeOff,
  MapPin,
  Gamepad2,
  Rocket,
  HeartHandshake,
  Images,
  ChevronRight,
  ChevronDown,
  Code2,
  Star,
  Sparkles,
  ExternalLink,
  FileText,
  BadgeCheck,
  Flame,
  Copy,
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
  const msg = encodeURIComponent(`Hi ${friendName}, I saw your Cyberpunk profile on CyberMohit AI!`);
  return `https://wa.me/${fullNum}?text=${msg}`;
};

export const FriendHeroProfile3D: React.FC<FriendHeroProfile3DProps> = ({
  friend,
  onClose,
  onOpenLightbox,
  fxLevel = 'high',
}) => {
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedFfUid, setCopiedFfUid] = useState(false);
  const [isAboutExpanded, setIsAboutExpanded] = useState(false);
  const [isPhoneVisible, setIsPhoneVisible] = useState(false);
  const [showFullGalleryModal, setShowFullGalleryModal] = useState(false);

  // Per-friend visibility controls (Configured from Admin Panel)
  const vis = friend.visibilitySettings || {};
  const showFreeFire = vis.showFreeFire !== false;
  const showPhone = vis.showPhone !== false;
  const showLocation = vis.showLocation !== false;
  const showHobby = vis.showHobby !== false;
  const showDream = vis.showDream !== false;
  const showReferredBy = vis.showReferredBy !== false;
  const showInstagram = vis.showInstagram !== false;
  const showGallery = vis.showGallery !== false;
  const showSocial = vis.showSocial !== false;
  const showAbout = vis.showAbout !== false;
  const showSkillsCard = vis.showSkillsCard !== false;
  const showProjectsCard = vis.showProjectsCard !== false;
  const showHobbiesCard = vis.showHobbiesCard !== false;
  const showDreamCard = vis.showDreamCard !== false;
  const showBottomCards = vis.showBottomCards !== false;

  const isSquadMember = (friend.cats || friend.categories || []).includes('squad');
  const accentColor = friend.accent || (isSquadMember ? '#FFB53D' : '#00F2FE');

  const avatarUrl = useMemo(() => {
    return resolveImageUrl(friend.avatar) || '/images/default-avatar.png';
  }, [friend.avatar]);

  const whatsappUrl = useMemo(() => {
    return getCleanWhatsappUrl(friend.whatsapp || friend.phone, friend.name);
  }, [friend.whatsapp, friend.phone, friend.name]);

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
    if (avatarUrl && !list.includes(avatarUrl)) {
      list.unshift(avatarUrl);
    }

    return list;
  }, [friend.gallery, friend.photos, friend.heroPhotos, avatarUrl]);

  // Up to 4 featured photos for the reference grid
  const featured4Photos = useMemo(() => {
    if (allGalleryPhotos.length >= 4) {
      return allGalleryPhotos.slice(0, 4);
    }
    if (allGalleryPhotos.length === 3) {
      return [...allGalleryPhotos, allGalleryPhotos[0]];
    }
    if (allGalleryPhotos.length === 2) {
      return [...allGalleryPhotos, allGalleryPhotos[0], allGalleryPhotos[1]];
    }
    if (allGalleryPhotos.length === 1) {
      return [allGalleryPhotos[0], allGalleryPhotos[0], allGalleryPhotos[0], allGalleryPhotos[0]];
    }
    return [avatarUrl, avatarUrl, avatarUrl, avatarUrl];
  }, [allGalleryPhotos, avatarUrl]);

  // Clean social links from friend.links
  const validLinks = useMemo(() => {
    return (friend.links || []).filter((l) => l && l.url && l.visible !== false);
  }, [friend.links]);

  // Name splitting for two-tone cyan + purple styling
  const { firstName, lastName } = useMemo(() => {
    const parts = (friend.name || 'Friend').trim().split(/\s+/);
    if (parts.length === 1) {
      return { firstName: parts[0], lastName: '' };
    }
    return {
      firstName: parts[0],
      lastName: parts.slice(1).join(' '),
    };
  }, [friend.name]);

  // Formatted phone display
  const rawPhone = friend.whatsapp || friend.phone || '';
  const maskedPhone = useMemo(() => {
    if (!rawPhone) return '';
    if (isPhoneVisible) return rawPhone;
    if (rawPhone.length >= 6) {
      const start = rawPhone.slice(0, 3);
      const end = rawPhone.slice(-2);
      return `${start} •••• ${end}`;
    }
    return '••••••••••';
  }, [rawPhone, isPhoneVisible]);

  // Copy Free Fire UID
  const handleCopyFfUid = (uid: string) => {
    sound.playClick();
    navigator.clipboard.writeText(uid);
    setCopiedFfUid(true);
    setTimeout(() => setCopiedFfUid(false), 2000);
  };

  // Trap Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showFullGalleryModal) {
          setShowFullGalleryModal(false);
          return;
        }
        sound.playClick();
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, showFullGalleryModal]);

  const handleShare = async () => {
    sound.playClick();
    const base = window.location.origin + window.location.pathname.replace(/\/+$/, '');
    const shareUrl = `${base}/?friend=${encodeURIComponent(friend.id)}`;
    const shareTitle = `${friend.name} - CyberMohit Friend Profile`;
    const shareText = `Check out ${friend.name}'s Cyberpunk Profile on CyberMohit AI! 🔥`;

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
      window.prompt('Profile Link:', shareUrl);
    }
  };

  const handleCopyLinkOnly = async () => {
    sound.playClick();
    const base = window.location.origin + window.location.pathname.replace(/\/+$/, '');
    const shareUrl = `${base}/?friend=${encodeURIComponent(friend.id)}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      window.prompt('Profile Link:', shareUrl);
    }
  };

  // Real, genuine admin data (Strictly NO fake demo fallback text)
  const locationText =
    friend.location ||
    (friend.city ? `${friend.city}${friend.state ? ', ' + friend.state : ''}` : '');

  const hobbiesText = friend.hobbies || friend.hobby || '';

  const dreamText = friend.dream || friend.goal || '';

  const referredByText = friend.referredBy || friend.relation || '';

  const taglineText =
    friend.tagline ||
    friend.role ||
    (friend.username ? `@${friend.username}` : 'Dream • Build • Create');

  const aboutText = friend.bio || (friend as any).story || (friend as any).description || '';

  // Clean parsed lists: strictly empty array if admin didn't input anything
  const skillsList = useMemo(() => {
    if (Array.isArray(friend.skills)) {
      return friend.skills.map((s) => String(s).trim()).filter(Boolean);
    }
    if (typeof friend.skills === 'string' && friend.skills.trim()) {
      return friend.skills.split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  }, [friend.skills]);

  const projectsList = useMemo(() => {
    if (Array.isArray(friend.projects)) {
      return friend.projects.map((p) => String(p).trim()).filter(Boolean);
    }
    if (typeof friend.projects === 'string' && friend.projects.trim()) {
      return friend.projects.split(',').map((p) => p.trim()).filter(Boolean);
    }
    return [];
  }, [friend.projects]);

  const hobbiesList = useMemo(() => {
    const list: string[] = [];
    if (showFreeFire && (friend.ffName || friend.ffUid)) {
      list.push(`Free Fire: ${friend.ffName || 'Player'} (UID: ${friend.ffUid || '—'})`);
    }
    if (friend.hobbies) {
      friend.hobbies.split(',').forEach((h) => {
        const tr = h.trim();
        if (tr && !list.includes(tr)) list.push(tr);
      });
    } else if (friend.hobby) {
      const tr = friend.hobby.trim();
      if (tr && !list.includes(tr)) list.push(tr);
    }
    return list;
  }, [friend.hobbies, friend.hobby, friend.ffName, friend.ffUid, showFreeFire]);

  const dreamList = useMemo(() => {
    if (friend.dream) {
      return friend.dream.split(',').map((d) => d.trim()).filter(Boolean);
    }
    if (friend.goal) {
      return friend.goal.split(',').map((d) => d.trim()).filter(Boolean);
    }
    return [];
  }, [friend.dream, friend.goal]);

  // Master check if at least 1 card is enabled and has actual content
  const hasAnyBottomCard = useMemo(() => {
    return (
      (showSkillsCard && skillsList.length > 0) ||
      (showProjectsCard && projectsList.length > 0) ||
      (showHobbiesCard && hobbiesList.length > 0) ||
      (showDreamCard && dreamList.length > 0)
    );
  }, [
    showSkillsCard,
    skillsList,
    showProjectsCard,
    projectsList,
    showHobbiesCard,
    hobbiesList,
    showDreamCard,
    dreamList,
  ]);

  // Instagram clean handle
  const rawInsta = friend.instagram || friend.username || '';
  const instaHandle = rawInsta.replace(/^@/, '').trim();

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${friend.name} Profile`}
      onPointerDown={() => {
        (window as any).__startBackgroundMusic?.();
      }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden bg-[#030611] text-slate-100 flex flex-col font-sans select-none"
      style={{
        background: 'radial-gradient(ellipse 100% 70% at 50% -10%, #0c1630 0%, #030611 65%)',
      }}
    >
      {/* Background Synthwave Landscape & Cyber Neon Lighting */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        {/* Top Cyber Mountain Ambient Horizon */}
        <div
          className="absolute top-0 left-0 right-0 h-[480px] opacity-40"
          style={{
            background:
              'radial-gradient(ellipse 80% 50% at 50% 20%, rgba(139, 92, 246, 0.28) 0%, rgba(0, 242, 254, 0.2) 40%, transparent 80%)',
          }}
        />
        {/* Subtle Cyber Grid Lines */}
        <div
          className="absolute inset-0 opacity-[0.035]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #00f2fe 1px, transparent 1px), linear-gradient(to bottom, #9b5cff 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }}
        />
      </div>

      {/* Top Header Bar (Matching Reference Exactly) */}
      <header className="relative z-20 w-full max-w-7xl mx-auto px-4 sm:px-8 py-4 flex items-center justify-between border-b border-cyan-500/15 backdrop-blur-md">
        {/* Left: CyberMohit AI Creator Logo */}
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-400/40 shadow-[0_0_15px_rgba(0,242,254,0.35)]">
            <svg
              viewBox="0 0 24 24"
              className="w-5 h-5 text-cyan-400 fill-current drop-shadow-[0_0_6px_#00f2fe]"
            >
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
            </svg>
          </div>
          <div className="flex flex-col">
            <span className="font-extrabold text-xs sm:text-sm tracking-[0.2em] text-white font-mono uppercase">
              CYBER<span className="text-cyan-400 text-glow-cyan">MOHIT</span>
            </span>
            <span className="text-[9px] tracking-[0.3em] text-cyan-300/70 font-mono uppercase">
              AI CREATOR
            </span>
          </div>
        </div>

        {/* Center: Navigation Pill Buttons */}
        <nav className="flex items-center gap-2 sm:gap-3">
          {/* Home Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 rounded-full bg-[#0a1226]/80 hover:bg-cyan-950/60 text-cyan-300 hover:text-white border border-cyan-500/40 hover:border-cyan-400 text-xs font-semibold shadow-[0_0_12px_rgba(0,242,254,0.2)] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer active:scale-95"
            title="होम / मुख्य पृष्ठ"
          >
            <Home className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline font-mono">Home</span>
          </button>

          {/* Friends Button (Closes profile back to friend grid) */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 rounded-full bg-cyan-500/15 hover:bg-cyan-500/25 text-white border border-cyan-400 text-xs font-semibold shadow-[0_0_15px_rgba(0,242,254,0.3)] transition-all cursor-pointer active:scale-95"
            title="सभी दोस्त देखें"
          >
            <Users className="w-3.5 h-3.5 text-cyan-300" />
            <span className="font-mono">Friends</span>
          </button>

          {/* Create Profile Button */}
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="flex items-center gap-1.5 px-3.5 sm:px-5 py-1.5 rounded-full bg-[#110d29]/80 hover:bg-purple-950/60 text-purple-300 hover:text-white border border-purple-500/40 hover:border-purple-400 text-xs font-semibold shadow-[0_0_12px_rgba(155,92,255,0.2)] hover:shadow-[0_0_20px_rgba(155,92,255,0.4)] transition-all cursor-pointer active:scale-95"
            title="प्रोफ़ाइल जोड़ें"
          >
            <Plus className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline font-mono">Create Profile</span>
          </button>
        </nav>

        {/* Right: Connect • Share • Grow & Close Button */}
        <div className="flex items-center gap-3">
          <span className="hidden lg:inline text-[10px] font-mono tracking-[0.25em] text-cyan-400/80 font-bold">
            CONNECT • SHARE • GROW
          </span>
          <button
            type="button"
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            aria-label="Close"
            className="p-1.5 rounded-full bg-[#0a1226]/80 border border-slate-700 hover:border-rose-400 text-slate-300 hover:text-rose-400 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="relative z-10 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 flex flex-col gap-8 flex-grow">
        {/* Top Hero Section: Large Circular Portrait (Left) + Name & Personal Info (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Huge Circular Holographic Portrait with Glowing Neon Rings */}
          <div className="lg:col-span-5 flex justify-center items-center">
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 flex items-center justify-center">
              {/* Outer Cyan Broken Circuit Ring */}
              <div
                className="absolute inset-0 rounded-full border-2 border-dashed border-cyan-400/60 animate-[spin_24s_linear_infinite]"
                style={{ filter: 'drop-shadow(0 0 12px #00f2fe)' }}
              />

              {/* Middle Electric Violet/Purple Glowing Ring */}
              <div
                className="absolute inset-3 rounded-full border-[3px] border-purple-500/80 animate-[spin_18s_linear_infinite_reverse]"
                style={{
                  boxShadow:
                    '0 0 25px rgba(155, 92, 255, 0.6), inset 0 0 25px rgba(155, 92, 255, 0.4)',
                }}
              />

              {/* Inner High-Intensity Cyan Glowing Bezel */}
              <div
                className="absolute inset-5 rounded-full border-[3px] border-cyan-400"
                style={{
                  boxShadow:
                    '0 0 35px #00f2fe, 0 0 65px rgba(0, 242, 254, 0.5), inset 0 0 20px rgba(0, 242, 254, 0.5)',
                }}
              />

              {/* High-Tech Orbital Light Dots */}
              <div className="absolute top-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-cyan-300 shadow-[0_0_12px_#00f2fe]" />
              <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-400 shadow-[0_0_12px_#9b5cff]" />

              {/* Friend Circular Portrait Image with Tap to Zoom */}
              <button
                type="button"
                onClick={() => {
                  sound.playClick();
                  onOpenLightbox(avatarUrl);
                }}
                className="relative z-10 w-[84%] h-[84%] rounded-full overflow-hidden bg-slate-950 cursor-pointer group active:scale-95 transition-transform"
                title={`${friend.name} - फ़ोटो बड़ा देखें`}
              >
                <img
                  src={avatarUrl}
                  alt={friend.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=800&q=80';
                  }}
                />
                {/* Holographic Subtle Scanline Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#00f2fe]/20 via-transparent to-transparent opacity-40 pointer-events-none" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <span className="px-3 py-1 rounded-full bg-black/80 border border-cyan-400 text-cyan-300 text-xs font-mono font-bold shadow-lg">
                    Zoom 🔍
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Right Column: Name, Tagline, Actions, & Personal Details Card */}
          <div className="lg:col-span-7 flex flex-col gap-4 text-left">
            {/* Header: Name with Neon Two-Tone Gradient & Verified Badge */}
            <div className="flex flex-col gap-1.5">
              <div className="flex items-center flex-wrap gap-2.5">
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight font-cyber uppercase leading-tight">
                  <span className="text-[#00f2fe] drop-shadow-[0_0_16px_rgba(0,242,254,0.8)]">
                    {firstName}{' '}
                  </span>
                  {lastName && (
                    <span className="bg-gradient-to-r from-[#b57cff] via-[#d946ef] to-[#ec4899] bg-clip-text text-transparent drop-shadow-[0_0_18px_rgba(217,70,239,0.7)]">
                      {lastName}
                    </span>
                  )}
                </h1>

                {/* Verified Shield Badge */}
                <div
                  className="flex items-center justify-center w-7 h-7 rounded-full bg-cyan-500/20 border border-cyan-400 text-cyan-300 shadow-[0_0_14px_#00f2fe]"
                  title="सत्यापित प्रोफ़ाइल (Verified Friend)"
                >
                  <BadgeCheck className="w-5 h-5 fill-cyan-400 text-[#030611]" />
                </div>
              </div>

              {/* Tagline */}
              <p className="text-xs sm:text-sm font-mono text-cyan-300/90 font-medium tracking-wide">
                {taglineText}
              </p>
            </div>

            {/* Action Buttons: Share Profile & Copy Link */}
            <div className="flex items-center gap-3 pt-1">
              {/* Share Profile Button */}
              <button
                type="button"
                onClick={handleShare}
                className="flex items-center gap-2 px-6 py-2.5 rounded-full bg-[#081838] hover:bg-[#0c2454] text-cyan-300 hover:text-white border border-cyan-400/80 shadow-[0_0_18px_rgba(0,242,254,0.35)] hover:shadow-[0_0_28px_rgba(0,242,254,0.6)] text-xs sm:text-sm font-mono font-bold cursor-pointer transition-all active:scale-95"
              >
                <Share2 className="w-4 h-4 text-cyan-400" />
                <span>Share Profile</span>
              </button>

              {/* Copy Link Button */}
              <button
                type="button"
                onClick={handleCopyLinkOnly}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-full text-xs sm:text-sm font-mono font-bold cursor-pointer transition-all border active:scale-95 ${
                  copiedLink
                    ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.5)]'
                    : 'bg-[#120f2e]/80 hover:bg-[#1a1440] text-purple-200 hover:text-white border-purple-500/60 hover:border-purple-400 shadow-[0_0_15px_rgba(155,92,255,0.25)]'
                }`}
              >
                {copiedLink ? (
                  <>
                    <Check className="w-4 h-4 text-emerald-400" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Link2 className="w-4 h-4 text-purple-400" />
                    <span>Copy Link</span>
                  </>
                )}
              </button>
            </div>

            {/* Personal Information Neon Card (Admin Configurable Fields) */}
            <div className="mt-2 rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
              <div className="divide-y divide-cyan-500/15">
                {/* Full Name */}
                <div className="flex items-center justify-between py-2.5">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                      <User className="w-4 h-4" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[11px] font-mono text-cyan-300/70">Full Name</span>
                      <span className="text-xs sm:text-sm font-semibold text-white">
                        {friend.fullName || friend.name}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Nickname (If present) */}
                {friend.nickname && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Users className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">Nickname</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {friend.nickname}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Free Fire Row (Name + UID with 1-Click Copy Button) */}
                {showFreeFire && (friend.ffName || friend.ffUid) && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-amber-500/15 text-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.3)]">
                        <Flame className="w-4 h-4 fill-amber-400 text-amber-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-amber-300/80">
                          Free Fire In-Game
                        </span>
                        <div className="flex items-center gap-2 flex-wrap">
                          {friend.ffName && (
                            <span className="text-xs sm:text-sm font-bold text-amber-200">
                              {friend.ffName}
                            </span>
                          )}
                          {friend.ffUid && (
                            <span className="text-[11px] font-mono text-slate-300 bg-slate-900/90 px-2 py-0.5 rounded border border-amber-500/30">
                              UID: {friend.ffUid}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {friend.ffUid && (
                      <button
                        type="button"
                        onClick={() => handleCopyFfUid(friend.ffUid!)}
                        className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                          copiedFfUid
                            ? 'bg-emerald-950/80 text-emerald-300 border-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : 'bg-slate-900/90 hover:bg-slate-800 text-amber-300 border-amber-500/40 hover:border-amber-400'
                        }`}
                        title="Free Fire UID कॉपी करें"
                      >
                        {copiedFfUid ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy UID</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Instagram Handle Row (If enabled & available) */}
                {showInstagram && instaHandle && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-pink-500/10 text-pink-400">
                        <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                        </svg>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-pink-300/80">Instagram</span>
                        <a
                          href={`https://instagram.com/${instaHandle}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs sm:text-sm font-semibold text-pink-300 hover:text-white hover:underline flex items-center gap-1"
                        >
                          <span>@{instaHandle}</span>
                          <ExternalLink className="w-3 h-3 opacity-70" />
                        </a>
                      </div>
                    </div>
                  </div>
                )}

                {/* Mobile Number with WhatsApp direct click & show/hide toggle */}
                {showPhone && rawPhone && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Phone className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">
                          Mobile Number
                        </span>
                        {whatsappUrl ? (
                          <a
                            href={whatsappUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs sm:text-sm font-semibold text-cyan-300 hover:text-white hover:underline flex items-center gap-1.5"
                            title="WhatsApp पर संदेश भेजें"
                          >
                            <span>{maskedPhone}</span>
                            <span className="text-[10px] text-emerald-400 font-mono">
                              (WhatsApp)
                            </span>
                          </a>
                        ) : (
                          <span className="text-xs sm:text-sm font-semibold text-white">
                            {maskedPhone}
                          </span>
                        )}
                      </div>
                    </div>
                    {rawPhone && (
                      <button
                        type="button"
                        onClick={() => setIsPhoneVisible(!isPhoneVisible)}
                        className="p-1.5 text-cyan-400/80 hover:text-cyan-300 cursor-pointer"
                        title={isPhoneVisible ? 'नंबर छुपाएं' : 'नंबर देखें'}
                      >
                        {isPhoneVisible ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    )}
                  </div>
                )}

                {/* Location (Only if enabled & non-empty) */}
                {showLocation && locationText && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">Location</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {locationText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Hobby (Only if enabled & non-empty) */}
                {showHobby && hobbiesText && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Gamepad2 className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">Hobby</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {hobbiesText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Dream (Only if enabled & non-empty) */}
                {showDream && dreamText && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <Rocket className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">Dream</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {dreamText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Referred By (Only if enabled & non-empty) */}
                {showReferredBy && referredByText && (
                  <div className="flex items-center justify-between py-2.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
                        <HeartHandshake className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[11px] font-mono text-cyan-300/70">Referred By</span>
                        <span className="text-xs sm:text-sm font-semibold text-white">
                          {referredByText}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Middle Section: Gallery (Left) + Connect With Me (Right) */}
        {(showGallery || showSocial) && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* Gallery Card (If enabled) */}
            {showGallery && (
              <div
                className={`${
                  showSocial ? 'lg:col-span-8' : 'lg:col-span-12'
                } rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(0,242,254,0.08)]`}
              >
                {/* Gallery Header */}
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                      <Images className="w-5 h-5" />
                    </div>
                    <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-white uppercase text-glow-cyan">
                      Gallery
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      sound.playClick();
                      setShowFullGalleryModal(true);
                    }}
                    className="flex items-center gap-1 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors"
                  >
                    <span>View All</span>
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                {/* 4 Photo Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {featured4Photos.map((imgUrl, idx) => (
                    <button
                      key={`${imgUrl}-${idx}`}
                      type="button"
                      onClick={() => {
                        sound.playClick();
                        onOpenLightbox(imgUrl);
                      }}
                      className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 hover:border-cyan-300 shadow-[0_0_12px_rgba(0,242,254,0.15)] hover:shadow-[0_0_24px_rgba(0,242,254,0.4)] transition-all cursor-pointer active:scale-95"
                    >
                      <img
                        src={imgUrl}
                        alt={`${friend.name} Photo ${idx + 1}`}
                        loading="lazy"
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-black/80 border border-cyan-400 text-cyan-300">
                          Zoom 🔍
                        </span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Connect With Me Card (If enabled) */}
            {showSocial && (
              <div
                className={`${
                  showGallery ? 'lg:col-span-4' : 'lg:col-span-12'
                } rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(0,242,254,0.08)] flex flex-col gap-3`}
              >
                {/* Header */}
                <div className="flex items-center gap-2.5 mb-1">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-white uppercase text-glow-cyan">
                    Connect With Me
                  </h2>
                </div>

                {/* Branded Social Buttons Stack */}
                <div className="flex flex-col gap-2.5">
                  {/* Instagram Button */}
                  {showInstagram &&
                    (() => {
                      const instaLink = validLinks.find(
                        (l) =>
                          l.url.toLowerCase().includes('instagram') || l.platform === 'instagram'
                      );
                      const instaUrl = instaLink
                        ? instaLink.url
                        : instaHandle
                        ? `https://instagram.com/${instaHandle}`
                        : null;
                      if (!instaUrl) return null;
                      return (
                        <a
                          href={instaUrl.startsWith('http') ? instaUrl : `https://${instaUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-gradient-to-r from-[#833ab4]/20 via-[#fd1d1d]/20 to-[#fcb045]/20 hover:from-[#833ab4]/35 hover:via-[#fd1d1d]/35 hover:to-[#fcb045]/35 border border-[#E1306C]/60 hover:border-[#E1306C] text-[#f77737] hover:text-white shadow-[0_0_15px_rgba(225,48,108,0.25)] hover:shadow-[0_0_25px_rgba(225,48,108,0.5)] transition-all cursor-pointer font-mono text-xs font-bold active:scale-95"
                        >
                          <div className="flex items-center gap-2.5">
                            <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                            </svg>
                            <span>Instagram</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                      );
                    })()}

                  {/* YouTube Button */}
                  {(() => {
                    const ytLink = validLinks.find(
                      (l) => l.url.toLowerCase().includes('youtube') || l.platform === 'youtube'
                    );
                    const ytUrl = ytLink ? ytLink.url : null;
                    if (!ytUrl) return null;
                    return (
                      <a
                        href={ytUrl.startsWith('http') ? ytUrl : `https://${ytUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => sound.playClick()}
                        className="flex items-center justify-between px-4 py-3 rounded-xl bg-red-950/30 hover:bg-red-950/50 border border-red-500/60 hover:border-red-400 text-red-300 hover:text-white shadow-[0_0_15px_rgba(239,68,68,0.25)] hover:shadow-[0_0_25px_rgba(239,68,68,0.5)] transition-all cursor-pointer font-mono text-xs font-bold active:scale-95"
                      >
                        <div className="flex items-center gap-2.5">
                          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                          </svg>
                          <span>YouTube</span>
                        </div>
                        <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                      </a>
                    );
                  })()}

                  {/* WhatsApp Button */}
                  {whatsappUrl && (
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => sound.playSuccess()}
                      className="flex items-center justify-between px-4 py-3 rounded-xl bg-emerald-950/30 hover:bg-emerald-950/50 border border-emerald-500/60 hover:border-emerald-400 text-emerald-300 hover:text-white shadow-[0_0_15px_rgba(16,185,129,0.25)] hover:shadow-[0_0_25px_rgba(16,185,129,0.5)] transition-all cursor-pointer font-mono text-xs font-bold active:scale-95"
                    >
                      <div className="flex items-center gap-2.5">
                        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z" />
                        </svg>
                        <span>WhatsApp</span>
                      </div>
                      <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                    </a>
                  )}

                  {/* Any Other Social Links Configured in Admin Panel */}
                  {validLinks
                    .filter(
                      (l) =>
                        !l.url.toLowerCase().includes('instagram') &&
                        !l.url.toLowerCase().includes('youtube') &&
                        l.platform !== 'instagram' &&
                        l.platform !== 'youtube'
                    )
                    .map((link, idx) => {
                      const meta = getSocialBrandMeta(link);
                      if (!meta.url) return null;
                      return (
                        <a
                          key={link.id || idx}
                          href={meta.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={() => sound.playClick()}
                          className="flex items-center justify-between px-4 py-3 rounded-xl bg-cyan-950/20 hover:bg-cyan-950/40 border border-cyan-500/50 hover:border-cyan-400 text-cyan-300 hover:text-white shadow-[0_0_15px_rgba(0,242,254,0.15)] hover:shadow-[0_0_20px_rgba(0,242,254,0.4)] transition-all cursor-pointer font-mono text-xs font-bold active:scale-95"
                        >
                          <div className="flex items-center gap-2.5">
                            {meta.icon}
                            <span>{meta.label}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 opacity-70" />
                        </a>
                      );
                    })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* About Me Section (Expandable Accordion - If enabled & non-empty) */}
        {showAbout && aboutText && (
          <div className="rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-5 shadow-[0_0_30px_rgba(0,242,254,0.08)]">
            <div
              className="flex items-center justify-between cursor-pointer"
              onClick={() => setIsAboutExpanded(!isAboutExpanded)}
            >
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                  <FileText className="w-5 h-5" />
                </div>
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-wide text-white uppercase text-glow-cyan">
                  About Me
                </h2>
              </div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-cyan-400 hover:text-cyan-300 transition-colors">
                <span>{isAboutExpanded ? 'Click to Collapse' : 'Click to Expand'}</span>
                {isAboutExpanded ? (
                  <ChevronDown className="w-4 h-4" />
                ) : (
                  <ChevronRight className="w-4 h-4" />
                )}
              </div>
            </div>

            <div
              className={`mt-4 text-xs sm:text-sm text-slate-300 leading-relaxed font-sans transition-all duration-300 ${
                isAboutExpanded
                  ? 'max-h-[500px] opacity-100'
                  : 'max-h-20 overflow-hidden opacity-90'
              }`}
            >
              <p>{aboutText}</p>
            </div>
          </div>
        )}

        {/* Bottom 4 Neon Grid Cards (My Skills, My Projects, My Hobbies, My Dream - Only if enabled and has content) */}
        {showBottomCards && hasAnyBottomCard && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {/* Card 1: My Skills (Only if enabled & has skills) */}
            {showSkillsCard && skillsList.length > 0 && (
              <div className="rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,242,254,0.08)] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono tracking-wide text-cyan-300 uppercase">
                    My Skills
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs font-medium text-slate-300">
                  {skillsList.map((skill, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                      <span>{skill}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Card 2: My Projects (Only if enabled & has projects) */}
            {showProjectsCard && projectsList.length > 0 && (
              <div className="rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,242,254,0.08)] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Star className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono tracking-wide text-cyan-300 uppercase">
                    My Projects
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs font-medium text-slate-300">
                  {projectsList.map((proj, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                      <span>{proj}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Card 3: My Hobbies & Gaming (Only if enabled & has hobbies/FF) */}
            {showHobbiesCard && hobbiesList.length > 0 && (
              <div className="rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,242,254,0.08)] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Gamepad2 className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono tracking-wide text-cyan-300 uppercase">
                    My Hobbies
                  </h3>
                </div>
                <ul className="space-y-2 text-xs font-medium text-slate-300">
                  {hobbiesList.map((h, idx) => (
                    <li key={idx} className="flex items-center justify-between gap-1 flex-wrap">
                      <div className="flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                        <span>{h}</span>
                      </div>
                      {showFreeFire && friend.ffUid && h.includes('Free Fire') && (
                        <button
                          type="button"
                          onClick={() => handleCopyFfUid(friend.ffUid!)}
                          className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40 hover:bg-amber-500/30 cursor-pointer"
                          title="Copy UID"
                        >
                          {copiedFfUid ? 'Copied!' : 'Copy UID'}
                        </button>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Card 4: My Dream (Only if enabled & has dream) */}
            {showDreamCard && dreamList.length > 0 && (
              <div className="rounded-2xl bg-[#070d1e]/85 backdrop-blur-xl border border-cyan-500/30 p-4 sm:p-5 shadow-[0_0_20px_rgba(0,242,254,0.08)] flex flex-col gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-lg bg-cyan-500/15 text-cyan-400">
                    <Rocket className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold font-mono tracking-wide text-cyan-300 uppercase">
                    My Dream
                  </h3>
                </div>
                <ul className="space-y-1.5 text-xs font-medium text-slate-300">
                  {dreamList.map((d, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 shadow-[0_0_6px_#00f2fe]" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}

        {/* Footer Typography (Exact Reference Style: "Better Version Of Me") */}
        <footer className="mt-6 pt-6 border-t border-cyan-500/20 text-center flex flex-col items-center gap-2">
          <div className="flex items-center justify-center gap-4 w-full max-w-md">
            <div className="flex-1 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-purple-500/60" />
            <span
              className="text-2xl sm:text-3xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-purple-300 to-pink-300 drop-shadow-[0_0_12px_rgba(217,70,239,0.7)]"
              style={{ fontFamily: 'Georgia, "Playfair Display", serif' }}
            >
              Better Version Of Me
            </span>
            <div className="flex-1 h-[1px] bg-gradient-to-l from-transparent via-cyan-400/60 to-purple-500/60" />
          </div>
          <span className="text-[10px] font-mono tracking-[0.25em] text-cyan-400/80 uppercase">
            CYBERMOHIT • AI CREATOR • DIGITAL IDENTITY
          </span>
        </footer>
      </main>

      {/* Full Photo Gallery Modal (When "View All" is tapped) */}
      <AnimatePresence>
        {showFullGalleryModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 backdrop-blur-xl flex flex-col p-4 sm:p-8 overflow-y-auto"
          >
            <div className="max-w-6xl mx-auto w-full flex flex-col gap-6">
              <div className="flex items-center justify-between border-b border-cyan-500/30 pb-4">
                <div className="flex items-center gap-3">
                  <Images className="w-6 h-6 text-cyan-400" />
                  <h3 className="text-xl font-bold font-mono text-white uppercase tracking-wider">
                    {friend.name} - Complete Photo Gallery ({allGalleryPhotos.length})
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFullGalleryModal(false)}
                  className="p-2 rounded-full bg-slate-900 border border-cyan-500 text-cyan-300 hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {allGalleryPhotos.map((photo, idx) => (
                  <button
                    key={`${photo}-${idx}`}
                    type="button"
                    onClick={() => onOpenLightbox(photo)}
                    className="group relative aspect-square rounded-xl overflow-hidden bg-slate-950 border border-cyan-500/40 hover:border-cyan-300 transition-all cursor-pointer shadow-md active:scale-95"
                  >
                    <img
                      src={photo}
                      alt={`${friend.name} Photo ${idx + 1}`}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <span className="text-xs font-mono font-bold px-3 py-1 rounded-full bg-black/80 border border-cyan-400 text-cyan-300">
                        Zoom 🔍
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
