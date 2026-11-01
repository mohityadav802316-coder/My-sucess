import React, { useState, useRef } from 'react';
import {
  Home,
  Plus,
  ArrowRight,
  Share2,
  Copy,
  Check,
  Instagram,
  MessageCircle,
  Phone,
  Flame,
  Sparkles,
  Download,
  Link as LinkIcon,
  X,
  User,
  Image as ImageIcon,
} from 'lucide-react';
import { Friend, resolveImageUrl } from '../data/friends';

interface ObsidianGoldProfileProps {
  friend: Friend;
  onBackHome?: () => void;
  /** आपके पहले से बने FriendRequest Form Modal को खोलने वाला फंक्शन */
  onOpenRequestModal: () => void;
}

/** मोबाइल नंबर को +91 ••••• •••30 फॉर्मेट में छुपाने वाला फंक्शन */
function maskPhoneNumber(rawPhone?: string | null): string {
  if (!rawPhone) return '+91 ••••• •••30';
  const digits = rawPhone.replace(/\D/g, '');
  if (digits.length < 2) return '+91 ••••• •••30';
  const lastTwo = digits.slice(-2);
  return `+91 ••••• •••${lastTwo}`;
}

export const ObsidianGoldProfile: React.FC<ObsidianGoldProfileProps> = ({
  friend,
  onBackHome,
  onOpenRequestModal,
}) => {
  const detailsRef = useRef<HTMLDivElement>(null);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [activePhotoIdx, setActivePhotoIdx] = useState(0);

  // नाम को दो हिस्सों में बाँटना (पहला नाम सफेद, सरनेम गोल्ड ग्रेडिएंट)
  const fullNameStr = friend.fullName || friend.name || 'Aditya Sharma';
  const nameParts = fullNameStr.trim().split(' ');
  const firstName = nameParts[0] || 'Aditya';
  const lastName = nameParts.slice(1).join(' ') || '';

  const roleOrTag =
    friend.tagline || friend.role || friend.nickname || 'VETERAN SNIPER LEGEND';
  const badgeRole = (friend.role || 'SNIPER').toUpperCase();

  // फोटो और गैलरी लिंक निकालना
  const avatarUrl = resolveImageUrl(friend.avatar);
  const galleryList = (
    friend.gallery?.length ? friend.gallery : friend.heroPhotos || []
  )
    .map((p) => resolveImageUrl(p))
    .filter(Boolean);

  // प्रोफाइल शेयर लिंक और डायनामिक QR कोड
  const profileShareUrl =
    typeof window !== 'undefined'
      ? `${window.location.origin}/?friend=${friend.id}`
      : `https://cybermohit.vercel.app/?friend=${friend.id}`;

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=320x320&data=${encodeURIComponent(
    profileShareUrl
  )}&bgcolor=F8F6F0&color=070709&margin=10`;

  // VIEW MORE दबाने पर नीचे 01 IDENTITY सेक्शन तक स्मूथ स्क्रॉल
  const handleScrollToDetails = () => {
    detailsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleCopyUid = () => {
    const uidToCopy = friend.ffUid || '8023521564';
    navigator.clipboard.writeText(uidToCopy);
    setCopiedUid(true);
    setTimeout(() => setCopiedUid(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(profileShareUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const handleWhatsAppShare = () => {
    const text = `Check out ${fullNameStr}'s Digital Identity on CYBERMOHIT: ${profileShareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const hobbiesArray = friend.hobbies
    ? friend.hobbies
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean)
    : friend.hobby
    ? [friend.hobby]
    : ['Gaming', 'Esports', 'Sniper Roles', 'Music'];

  const cleanWhatsappNumber = (friend.whatsapp || friend.phone || '').replace(
    /\D/g,
    ''
  );

  return (
    <div className="min-h-screen bg-[#050507] text-[#F5F2EB] font-sans selection:bg-[#D4AF37] selection:text-black relative overflow-x-hidden scroll-smooth">
      {/* प्रीमियम फॉन्ट और Obsidian Gold स्टाइल्स */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,600;0,700;1,600&family=Plus+Jakarta+Sans:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600&display=swap');
        
        .font-serif-luxury { font-family: 'Cormorant Garamond', Georgia, serif; }
        .font-mono-tech { font-family: 'JetBrains Mono', monospace; }
        
        .gold-text-gradient {
          background: linear-gradient(180deg, #FFF5C0 0%, #D4AF37 55%, #9A6F18 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .gold-pill-btn {
          background: linear-gradient(135deg, #F6E6A5 0%, #D4AF37 50%, #A67819 100%);
          box-shadow: 0 8px 28px -4px rgba(212, 175, 55, 0.45), inset 0 1px 1px rgba(255, 255, 255, 0.6);
        }
        
        .obsidian-card {
          background: linear-gradient(180deg, rgba(24, 21, 16, 0.88) 0%, rgba(9, 9, 11, 0.96) 100%);
          border: 1px solid rgba(212, 175, 55, 0.24);
          box-shadow: 0 14px 34px -12px rgba(0, 0, 0, 0.9), inset 0 1px 0 0 rgba(255, 243, 176, 0.12);
        }

        .arch-glow {
          background: radial-gradient(circle at 50% 32%, rgba(212, 175, 55, 0.20) 0%, rgba(18, 15, 10, 0.92) 65%, #070709 100%);
          box-shadow: 0 20px 60px -15px rgba(0, 0, 0, 0.95), 0 0 40px 0 rgba(212, 175, 55, 0.08);
        }
      `}</style>

      {/* बैकग्राउंड एम्बिएंट गोल्ड ग्लो */}
      <div className="pointer-events-none fixed top-12 left-1/2 -translate-x-1/2 w-[320px] h-[320px] rounded-full bg-[#D4AF37]/10 blur-[120px] z-0" />

      <div className="relative z-10 max-w-[420px] mx-auto px-5">
        {/* ===================================================================
            SECTION A: FULL-SCREEN HERO ARCH CARD (पहला स्क्रीन)
        =================================================================== */}
        <div className="min-h-screen flex flex-col justify-between py-6">
          {/* Top Header */}
          <header className="flex items-center justify-between">
            <button
              onClick={onBackHome}
              type="button"
              aria-label="Home"
              className="w-11 h-11 rounded-full border border-[#D4AF37]/30 bg-[#0E0D0A] flex items-center justify-center text-[#D4AF37] hover:border-[#D4AF37] active:scale-95 transition"
            >
              <Home className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2.5">
              {/* Hexagon / Diamond F Badge */}
              <div className="w-6 h-6 rotate-45 rounded-[3px] border border-[#D4AF37]/70 bg-[#D4AF37]/10 flex items-center justify-center">
                <span className="-rotate-45 text-[10px] font-bold text-[#D4AF37]">
                  F
                </span>
              </div>
              <span className="text-[11px] font-mono-tech tracking-[0.28em] text-[#E6D3A3] uppercase">
                CYBERMOHIT
              </span>
            </div>

            {/* + Button -> आपका FriendRequest Form Modal खोलेगा */}
            <button
              onClick={onOpenRequestModal}
              type="button"
              aria-label="Create Profile"
              className="w-11 h-11 rounded-full gold-pill-btn text-black flex items-center justify-center hover:brightness-110 active:scale-95 transition"
            >
              <Plus className="w-5 h-5 stroke-[2.4]" />
            </button>
          </header>

          {/* Center Arch Frame + Portrait */}
          <div className="my-auto py-4 flex flex-col items-center">
            <div className="w-full max-w-[295px] aspect-[3/4.15] rounded-t-full rounded-b-[20px] p-[7px] border border-[#D4AF37]/40 arch-glow relative">
              <div className="w-full h-full rounded-t-full rounded-b-[14px] border border-[#D4AF37]/25 overflow-hidden relative flex flex-col items-center justify-center bg-[#090806]">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    alt={fullNameStr}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  /* Default Minimal Gold Line-Art Avatar */
                  <svg
                    viewBox="0 0 200 240"
                    className="w-44 h-44 stroke-[#D4AF37]/45 fill-none"
                    strokeWidth="1.5"
                  >
                    <circle cx="100" cy="82" r="34" />
                    <path
                      d="M42 195 C42 145, 158 145, 158 195"
                      strokeLinecap="round"
                    />
                  </svg>
                )}

                {/* Bottom Dark Gradient & Label */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-transparent pointer-events-none" />
                <span className="absolute bottom-3.5 text-[9.5px] font-mono-tech tracking-[0.24em] text-[#B8A88A]/75 uppercase">
                  [ PORTRAIT PHOTO ]
                </span>
              </div>
            </div>

            {/* Name & Subtitle */}
            <div className="mt-6 text-center">
              <h1 className="font-serif-luxury text-[48px] leading-[1.02] font-bold tracking-tight">
                <span className="block text-[#FAF8F5]">{firstName}</span>
                {lastName && (
                  <span className="block gold-text-gradient">{lastName}</span>
                )}
              </h1>

              {/* Gold Line with Red Ruby Dot */}
              <div className="flex items-center justify-center gap-3 my-3.5">
                <span className="w-9 h-[1px] bg-gradient-to-r from-transparent to-[#D4AF37]/50" />
                <span className="w-1.5 h-1.5 rounded-full bg-[#E11D48] shadow-[0_0_8px_#E11D48]" />
                <span className="w-9 h-[1px] bg-gradient-to-l from-transparent to-[#D4AF37]/50" />
              </div>

              <p className="text-[10.5px] font-mono-tech tracking-[0.26em] text-[#B9B0A0] uppercase">
                {roleOrTag}
              </p>
            </div>
          </div>

          {/* VIEW MORE Button */}
          <div className="flex justify-center pb-2">
            <button
              onClick={handleScrollToDetails}
              type="button"
              className="gold-pill-btn text-black font-semibold text-[11px] tracking-[0.2em] uppercase px-9 py-4 rounded-full flex items-center gap-3 hover:brightness-110 active:scale-95 transition"
            >
              <span>VIEW MORE</span>
              <ArrowRight className="w-4 h-4 stroke-[2.2]" />
            </button>
          </div>
        </div>

        {/* ===================================================================
            SECTION B: SCROLLABLE DOSSIER (01 से 06 तक के कार्ड्स)
        =================================================================== */}
        <div ref={detailsRef} className="pt-8 pb-16 space-y-6">
          {/* Sub-Header Action Bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rotate-45 border border-[#D4AF37]/60 flex items-center justify-center bg-[#D4AF37]/10">
                <span className="-rotate-45 text-[9px] font-bold text-[#D4AF37]">
                  F
                </span>
              </div>
              <span className="text-[10px] font-mono-tech tracking-[0.25em] text-[#D4AF37]/80 uppercase">
                DOSSIER
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={onOpenRequestModal}
                type="button"
                className="gold-pill-btn text-black text-[10px] font-bold tracking-[0.14em] uppercase px-3.5 py-2 rounded-full flex items-center gap-1"
              >
                <Plus className="w-3 h-3 stroke-[2.5]" /> CREATE PROFILE
              </button>
              <button
                onClick={() => setIsShareOpen(true)}
                type="button"
                aria-label="Share Profile"
                className="w-9 h-9 rounded-full border border-[#D4AF37]/35 bg-[#12110E] flex items-center justify-center text-[#D4AF37] hover:border-[#D4AF37] transition"
              >
                <Share2 className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Mini Summary Banner Card */}
          <div className="obsidian-card rounded-2xl p-3.5 flex items-center gap-4">
            <div className="w-20 h-28 rounded-t-full rounded-b-xl border border-[#D4AF37]/40 bg-[#0B0A08] overflow-hidden shrink-0 flex items-center justify-center">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={fullNameStr}
                  className="w-full h-full object-cover"
                />
              ) : (
                <User className="w-9 h-9 text-[#D4AF37]/40 stroke-[1.2]" />
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-serif-luxury text-2xl font-bold leading-tight text-white truncate">
                  {firstName}{' '}
                  <span className="gold-text-gradient">{lastName}</span>
                </h2>
                <span className="text-[9px] font-mono-tech tracking-widest uppercase px-2 py-0.5 rounded border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F3E5AB] shrink-0">
                  {badgeRole}
                </span>
              </div>

              <p className="text-[10px] font-mono-tech tracking-[0.18em] text-[#C8B99E] uppercase mt-1 truncate">
                {roleOrTag}
              </p>

              <div className="flex items-center gap-2 mt-3">
                {friend.instagram && (
                  <a
                    href={`https://instagram.com/${friend.instagram.replace('@', '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full border border-[#D4AF37]/30 bg-black/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition"
                  >
                    <Instagram className="w-3.5 h-3.5" />
                  </a>
                )}
                {cleanWhatsappNumber && (
                  <a
                    href={`https://wa.me/${cleanWhatsappNumber}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-7 h-7 rounded-full border border-[#D4AF37]/30 bg-black/50 flex items-center justify-center text-[#D4AF37] hover:bg-[#D4AF37] hover:text-black transition"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                  </a>
                )}
                <button
                  onClick={() => setIsShareOpen(true)}
                  type="button"
                  className="ml-auto text-[10px] font-mono-tech tracking-wider text-[#D4AF37] hover:underline"
                >
                  SHARE PASS →
                </button>
              </div>
            </div>
          </div>

          {/* 01 IDENTITY */}
          <section className="space-y-2.5">
            <SectionHeader number="01" title="IDENTITY" />
            <div className="grid grid-cols-2 gap-2.5">
              <div className="obsidian-card rounded-xl p-3.5">
                <span className="text-[9px] font-mono-tech tracking-[0.2em] text-[#9E9585] uppercase block">
                  FULL NAME
                </span>
                <p className="font-serif-luxury text-lg font-semibold text-white mt-0.5 truncate">
                  {fullNameStr}
                </p>
              </div>

              <div className="obsidian-card rounded-xl p-3.5">
                <span className="text-[9px] font-mono-tech tracking-[0.2em] text-[#9E9585] uppercase block">
                  NICKNAME
                </span>
                <p className="font-serif-luxury text-lg font-semibold gold-text-gradient mt-0.5 truncate">
                  {friend.nickname || 'Veteran Sniper Legend'}
                </p>
              </div>

              {(friend.visibilitySettings?.showPhone ?? true) && (
                <div className="obsidian-card rounded-xl p-3.5 col-span-2 flex items-center justify-between">
                  <div>
                    <span className="text-[9px] font-mono-tech tracking-[0.2em] text-[#9E9585] uppercase block">
                      MOBILE
                    </span>
                    <p className="font-mono-tech text-xs text-[#F5F2EB] mt-1 tracking-wider">
                      {maskPhoneNumber(friend.phone || friend.whatsapp)}
                    </p>
                  </div>
                  <Phone className="w-4 h-4 text-[#D4AF37]/60" />
                </div>
              )}
            </div>
          </section>

          {/* 02 GALLERY */}
          {(friend.visibilitySettings?.showGallery ?? true) && (
            <section className="space-y-2.5">
              <SectionHeader number="02" title="GALLERY" />
              <div className="obsidian-card rounded-2xl p-3 space-y-2.5">
                <div className="w-full aspect-[4/3] rounded-xl overflow-hidden bg-[#0A0907] border border-[#D4AF37]/20 flex items-center justify-center">
                  {galleryList.length > 0 ? (
                    <img
                      src={galleryList[activePhotoIdx] || galleryList[0]}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt="Gallery"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex flex-col items-center text-[#D4AF37]/40">
                      <ImageIcon className="w-10 h-10 stroke-[1]" />
                      <span className="text-[10px] font-mono-tech mt-2 tracking-widest">
                        [ GALLERY PREVIEW ]
                      </span>
                    </div>
                  )}
                </div>

                {galleryList.length > 1 && (
                  <div className="grid grid-cols-4 gap-2">
                    {galleryList.slice(0, 4).map((imgUrl, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActivePhotoIdx(idx)}
                        className={`aspect-square rounded-lg overflow-hidden border transition ${
                          activePhotoIdx === idx
                            ? 'border-[#D4AF37] scale-[0.98]'
                            : 'border-white/10 opacity-60 hover:opacity-100'
                        }`}
                      >
                        <img
                          src={imgUrl}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}

          {/* 03 CONNECT */}
          {(friend.visibilitySettings?.showSocial ?? true) && (
            <section className="space-y-2.5">
              <SectionHeader number="03" title="CONNECT" />
              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={
                    friend.instagram
                      ? `https://instagram.com/${friend.instagram.replace('@', '')}`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="obsidian-card rounded-xl p-3.5 flex items-center gap-3 hover:border-[#D4AF37]/60 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <Instagram className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono-tech tracking-widest text-[#9E9585] block">
                      INSTAGRAM
                    </span>
                    <p className="text-xs font-medium text-white truncate">
                      {friend.instagram || '@vgl_army'}
                    </p>
                  </div>
                </a>

                <a
                  href={
                    cleanWhatsappNumber
                      ? `https://wa.me/${cleanWhatsappNumber}`
                      : '#'
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="obsidian-card rounded-xl p-3.5 flex items-center gap-3 hover:border-[#D4AF37]/60 transition"
                >
                  <div className="w-9 h-9 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shrink-0">
                    <MessageCircle className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <span className="text-[9px] font-mono-tech tracking-widest text-[#9E9585] block">
                      WHATSAPP
                    </span>
                    <p className="text-xs font-medium text-white truncate">
                      Message
                    </p>
                  </div>
                </a>
              </div>
            </section>
          )}

          {/* 04 ABOUT ME */}
          {(friend.visibilitySettings?.showAbout ?? true) && (
            <section className="space-y-2.5">
              <SectionHeader number="04" title="ABOUT ME" />
              <div className="obsidian-card rounded-xl p-4">
                <p className="font-serif-luxury text-base leading-relaxed text-[#DDD5C7] italic">
                  {friend.bio || '[ About me text goes here ]'}
                </p>
              </div>
            </section>
          )}

          {/* 05 HOBBIES & FREE FIRE */}
          <section className="space-y-2.5">
            <SectionHeader number="05" title="HOBBIES" />
            <div className="flex flex-wrap gap-2">
              {hobbiesArray.map((item, i) => (
                <span
                  key={i}
                  className="text-[11px] px-3.5 py-1.5 rounded-full obsidian-card text-[#F3E5AB] flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                  {item}
                </span>
              ))}
            </div>

            {(friend.visibilitySettings?.showFreeFire ?? true) && (
              <div className="obsidian-card rounded-xl p-4 mt-2 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl gold-pill-btn text-black flex items-center justify-center">
                    <Flame className="w-5 h-5 fill-black" />
                  </div>
                  <div>
                    <span className="text-[9px] font-mono-tech tracking-[0.22em] text-[#D4AF37] uppercase block">
                      FREE FIRE
                    </span>
                    <p className="text-sm font-bold tracking-wide text-white">
                      {friend.ffName || 'VGL_AADITYA'}
                    </p>
                    <p className="text-[11px] font-mono-tech text-[#9E9585]">
                      UID {friend.ffUid || '8023521564'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleCopyUid}
                  type="button"
                  className="px-3 py-1.5 rounded-lg border border-[#D4AF37]/40 bg-[#D4AF37]/10 text-[#F3E5AB] text-[10px] font-mono-tech flex items-center gap-1.5 hover:bg-[#D4AF37] hover:text-black transition"
                >
                  {copiedUid ? (
                    <Check className="w-3.5 h-3.5" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedUid ? 'COPIED' : 'COPY'}
                </button>
              </div>
            )}
          </section>

          {/* 06 SCAN */}
          <section className="space-y-2.5">
            <SectionHeader number="06" title="SCAN" />
            <div className="obsidian-card rounded-2xl p-4 flex items-center gap-4">
              <div
                onClick={() => setIsShareOpen(true)}
                className="w-20 h-20 rounded-xl bg-[#F8F6F0] p-1.5 shrink-0 cursor-pointer hover:scale-105 transition"
              >
                <img
                  src={qrImageUrl}
                  alt="Profile QR"
                  className="w-full h-full object-contain"
                />
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <span className="text-[10px] font-mono-tech tracking-[0.2em] text-[#D4AF37] uppercase block">
                  [ PROFILE LINK ]
                </span>
                <p className="text-[11px] font-mono-tech text-[#9E9585] truncate">
                  {profileShareUrl}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <button
                    onClick={handleCopyLink}
                    type="button"
                    className="text-[10px] font-mono-tech px-3 py-1 rounded bg-[#D4AF37]/15 border border-[#D4AF37]/40 text-[#F3E5AB]"
                  >
                    {copiedLink ? 'COPIED ✓' : 'COPY LINK'}
                  </button>
                  <button
                    onClick={() => setIsShareOpen(true)}
                    type="button"
                    className="text-[10px] font-mono-tech px-3 py-1 rounded gold-pill-btn text-black font-semibold"
                  >
                    SHARE CARD
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Bottom Create Profile CTA */}
          <footer className="pt-4 text-center space-y-3">
            <button
              onClick={onOpenRequestModal}
              type="button"
              className="w-full py-3.5 rounded-full gold-pill-btn text-black font-bold text-xs tracking-[0.2em] uppercase hover:brightness-110 active:scale-95 transition"
            >
              + CREATE YOUR PROFILE
            </button>
            <p className="text-[10px] font-mono-tech tracking-[0.25em] text-[#9E9585] uppercase">
              CYBERMOHIT DIGITAL IDENTITY
            </p>
          </footer>
        </div>
      </div>

      {/* ===================================================================
          SHARE & QR MODAL
      =================================================================== */}
      {isShareOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="obsidian-card w-full max-w-xs rounded-3xl p-6 text-center relative animate-in fade-in zoom-in-95 duration-200">
            <button
              onClick={() => setIsShareOpen(false)}
              type="button"
              className="absolute top-4 right-4 w-8 h-8 rounded-full border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37]"
            >
              <X className="w-4 h-4" />
            </button>

            <span className="text-[10px] font-mono-tech tracking-[0.3em] text-[#D4AF37] uppercase block">
              SHARE
            </span>
            <p className="text-[9px] font-mono-tech tracking-[0.25em] text-[#9E9585] uppercase mt-0.5">
              CYBERMOHIT
            </p>

            <div className="w-48 h-48 mx-auto my-5 rounded-2xl bg-[#F8F6F0] p-3 shadow-[0_0_35px_rgba(212,175,55,0.22)]">
              <img
                src={qrImageUrl}
                alt="QR Code"
                className="w-full h-full object-contain"
              />
            </div>

            <h3 className="font-serif-luxury text-3xl font-bold text-white">
              {firstName} <span className="gold-text-gradient">{lastName}</span>
            </h3>
            <p className="text-[10px] font-mono-tech tracking-[0.22em] text-[#D4AF37] uppercase mt-1">
              {roleOrTag}
            </p>

            <div className="mt-6 space-y-2.5">
              <button
                onClick={handleWhatsAppShare}
                type="button"
                className="w-full py-3 rounded-full gold-pill-btn text-black font-bold text-xs tracking-[0.15em] uppercase flex items-center justify-center gap-2"
              >
                <MessageCircle className="w-4 h-4 fill-black" />
                SEND ON WHATSAPP
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <a
                  href={qrImageUrl}
                  download={`${firstName}-QR.png`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 rounded-full border border-[#D4AF37]/40 bg-[#14120E] text-[#F3E5AB] text-[10px] font-mono-tech tracking-widest uppercase flex items-center justify-center gap-1.5"
                >
                  <Download className="w-3.5 h-3.5" /> SAVE
                </a>
                <button
                  onClick={handleCopyLink}
                  type="button"
                  className="py-2.5 rounded-full border border-[#D4AF37]/40 bg-[#14120E] text-[#F3E5AB] text-[10px] font-mono-tech tracking-widest uppercase flex items-center justify-center gap-1.5"
                >
                  <LinkIcon className="w-3.5 h-3.5" />{' '}
                  {copiedLink ? 'COPIED' : 'LINK'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ObsidianGoldProfile;

/* सेक्शन हेडर (01 IDENTITY, 02 GALLERY आदि के लिए) */
const SectionHeader: React.FC<{ number: string; title: string }> = ({
  number,
  title,
}) => (
  <div className="flex items-center gap-2.5 px-1">
    <span className="text-[11px] font-mono-tech text-[#D4AF37] font-semibold">
      {number}
    </span>
    <span className="text-[11px] font-mono-tech tracking-[0.22em] text-[#F5F2EB] uppercase font-semibold">
      {title}
    </span>
    <div className="flex-1 h-[1px] bg-gradient-to-r from-[#D4AF37]/35 to-transparent" />
  </div>
);
