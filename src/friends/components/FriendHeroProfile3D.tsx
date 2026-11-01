import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, type Variants } from 'motion/react';
import { Friend, resolveImageUrl, PhotoInput } from '../data/friends';
import { useFriendsConfig } from '../data/repository';
import { getFriendShareUrl } from '../utils/shareUrl';
import { sound } from '../../components/audio/SoundEffects';
import { getSocialBrandMeta } from '../utils/socialUtils';
import {
  Home,
  Share2,
  Check,
  X,
  Eye,
  EyeOff,
  Flame,
  Copy,
  ArrowUpRight,
  Sparkles,
  MapPin,
  User,
  Edit3,
  Plus,
} from 'lucide-react';

interface FriendHeroProfile3DProps {
  friend: Friend;
  onClose: () => void;
  onOpenLightbox: (imageUrl: string) => void;
  onOpenEditProfile?: () => void;
  onOpenCreateProfile?: () => void;
  fxLevel?: 'high' | 'low' | 'minimal';
}

/* ============================ DESIGN TOKENS ============================ */
const TOKENS = {
  '--ink': '#070707',
  '--panel': '#0D0C0A',
  '--gold': '#C9A55C',
  '--gold-soft': '#E8D6A6',
  '--text': '#F2EBDD',
  '--muted': '#8A8070',
  '--line': 'rgba(201,165,92,0.18)',
  '--line-strong': 'rgba(201,165,92,0.45)',
} as React.CSSProperties;

const SERIF = { fontFamily: '"Cormorant Garamond", "Playfair Display", Georgia, serif' };
const SANS = { fontFamily: 'Inter, system-ui, sans-serif' };
const GOLD_TEXT: React.CSSProperties = {
  backgroundImage: 'linear-gradient(120deg, var(--gold-soft), var(--gold) 55%, #9C7B3C)',
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
};

const EASE = [0.22, 1, 0.36, 1] as const;
const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE } },
};

/* ================================ HELPERS ================================ */
const getCleanWhatsappUrl = (raw: string | null | undefined, name = '') => {
  const v = raw?.trim();
  if (!v) return null;
  if (/^https?:\/\/wa\.me\//.test(v)) return v;
  const digits = v.replace(/\D/g, '');
  if (!digits) return null;
  const num = digits.length === 10 ? `91${digits}` : digits;
  return `https://wa.me/${num}?text=${encodeURIComponent(`Hi ${name}, I saw your profile on CyberMohit!`)}`;
};

const uniquePhotos = (...lists: (PhotoInput[] | string[] | undefined | null)[]) => {
  const set = new Set<string>();
  lists.forEach((l) =>
    (Array.isArray(l) ? l : []).forEach((p) => {
      const u = resolveImageUrl(p as any);
      if (u) set.add(u);
    })
  );
  return [...set];
};

/* ============================ SMALL COMPONENTS ============================ */
const IconButton: React.FC<{
  onClick: () => void;
  title: string;
  size?: string;
  children: React.ReactNode;
}> = ({ onClick, title, size = 'w-11 h-11', children }) => (
  <button
    type="button"
    title={title}
    aria-label={title}
    onClick={onClick}
    className={`${size} rounded-full flex items-center justify-center text-[color:var(--gold)] border border-[color:var(--line-strong)] bg-black/60 hover:text-[color:var(--gold-soft)] hover:border-[color:var(--gold)] active:scale-95 transition-all cursor-pointer`}
  >
    {children}
  </button>
);

const SectionHeader: React.FC<{ num: string; title: string; right?: React.ReactNode }> = ({
  num,
  title,
  right,
}) => (
  <div className="flex items-center gap-3 mb-5">
    <span className="text-3xl font-light leading-none" style={{ ...SERIF, ...GOLD_TEXT }}>
      {num}
    </span>
    <span
      className="text-[10px] font-semibold tracking-[0.35em] uppercase text-[color:var(--text)]"
      style={SANS}
    >
      {title}
    </span>
    <div className="flex-1 h-px bg-gradient-to-r from-[color:var(--line-strong)] to-transparent" />
    {right}
  </div>
);

const Row: React.FC<{
  label: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
  children: React.ReactNode;
}> = ({ label, icon, action, children }) => (
  <div className="py-4 flex items-center justify-between gap-4 border-b border-[color:var(--line)] last:border-b-0">
    <div className="flex flex-col gap-1.5 min-w-0">
      <span
        className="text-[9px] tracking-[0.3em] uppercase text-[color:var(--muted)] flex items-center gap-1.5"
        style={SANS}
      >
        {icon}
        {label}
      </span>
      <div className="text-[color:var(--text)] break-words select-text">{children}</div>
    </div>
    {action}
  </div>
);

const ConnectCard: React.FC<{
  icon: React.ReactNode;
  label: string;
  value: string;
  href: string;
  onClick?: () => void;
}> = ({ icon, label, value, href, onClick }) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    onClick={onClick}
    className="group flex items-center justify-between px-5 py-4 rounded-2xl bg-[color:var(--panel)] border border-[color:var(--line)] hover:border-[color:var(--line-strong)] transition-colors active:scale-[0.99]"
  >
    <div className="flex items-center gap-4 min-w-0">
      <span className="text-[color:var(--gold)] w-5 h-5 flex items-center justify-center shrink-0">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="text-[9px] tracking-[0.3em] uppercase text-[color:var(--muted)]" style={SANS}>
          {label}
        </span>
        <span className="text-sm text-[color:var(--text)] truncate" style={SANS}>
          {value}
        </span>
      </div>
    </div>
    <ArrowUpRight className="w-4 h-4 text-[color:var(--gold)] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
  </a>
);

const GalleryTile: React.FC<{ src: string; className?: string; onClick: () => void; alt: string }> = ({
  src,
  className = '',
  onClick,
  alt,
}) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative overflow-hidden rounded-2xl bg-[color:var(--panel)] border border-[color:var(--line)] hover:border-[color:var(--line-strong)] transition-colors cursor-pointer ${className}`}
  >
    <img
      src={src}
      alt={alt}
      loading="lazy"
      decoding="async"
      className="w-full h-full object-cover brightness-90 group-hover:brightness-105 transition-[filter] duration-500"
    />
  </button>
);

const InstagramIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={1.5} viewBox="0 0 24 24">
    <rect x="2" y="2" width="20" height="20" rx="5" />
    <circle cx="12" cy="12" r="4" />
    <circle cx="17.5" cy="6.5" r="0.6" />
  </svg>
);

const WhatsappIcon = () => (
  <svg className="w-5 h-5 fill-none stroke-current" strokeWidth={1.5} viewBox="0 0 24 24">
    <path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8z" />
  </svg>
);

/* ================================ MAIN ================================ */
export const FriendHeroProfile3D: React.FC<FriendHeroProfile3DProps> = ({
  friend,
  onClose,
  onOpenLightbox,
  onOpenEditProfile,
  onOpenCreateProfile,
}) => {
  const { settings } = useFriendsConfig();
  const [copiedLink, setCopiedLink] = useState(false);
  const [copiedUid, setCopiedUid] = useState(false);
  const [phoneVisible, setPhoneVisible] = useState(false);
  const [galleryOpen, setGalleryOpen] = useState(false);
  const [avatarFailed, setAvatarFailed] = useState(false);

  // Admin visibility (default: visible)
  const vis = friend.visibilitySettings || {};
  const show = (k: keyof typeof vis) => (vis as Record<string, boolean | undefined>)[k] !== false;

  // Optional extra text fields (type में हों तो दिखेंगे)
  const extra = friend as unknown as Record<string, unknown>;
  const str = (k: string) => (typeof extra[k] === 'string' ? (extra[k] as string).trim() : '');

  const avatarUrl = useMemo(() => resolveImageUrl(friend.avatar) || '', [friend.avatar]);
  const displayName = friend.fullName || friend.name;
  const roleTitle = friend.role || 'MEMBER';
  const tagline = friend.tagline || friend.nickname || '';

  const photos = useMemo(() => {
    const all = uniquePhotos(friend.gallery, friend.photos, friend.heroPhotos);
    return avatarUrl && !all.includes(avatarUrl) ? [avatarUrl, ...all] : all;
  }, [friend.gallery, friend.photos, friend.heroPhotos, avatarUrl]);

  const featured = useMemo(
    () => (photos.length ? Array.from({ length: 4 }, (_, i) => photos[i % photos.length]) : []),
    [photos]
  );

  const rawPhone = friend.whatsapp || friend.phone || '';
  const whatsappUrl = useMemo(
    () => getCleanWhatsappUrl(rawPhone, friend.name),
    [rawPhone, friend.name]
  );
  const phoneText = useMemo(() => {
    if (!rawPhone) return '';
    if (phoneVisible) return rawPhone.startsWith('+') ? rawPhone : `+91 ${rawPhone}`;
    return `+91 •••• ••• ${rawPhone.replace(/\D/g, '').slice(-2) || '00'}`;
  }, [rawPhone, phoneVisible]);

  const instaHandle = (friend.instagram || friend.username || '').replace(/^@/, '').trim();

  const otherLinks = useMemo(
    () =>
      (friend.links || [])
        .filter((l) => l?.url && l.visible !== false)
        .filter((l) => !/instagram|wa\.me|whatsapp/i.test(l.url)),
    [friend.links]
  );

  const click = useCallback(() => sound.playClick(), []);
  const close = useCallback(() => {
    click();
    onClose();
  }, [click, onClose]);

  const flash = (set: (v: boolean) => void, ms = 2200) => {
    set(true);
    setTimeout(() => set(false), ms);
  };

  const handleShare = async () => {
    click();
    const url = getFriendShareUrl(friend.id, settings.publicSiteUrl);
    if (navigator.share) {
      try {
        await navigator.share({ title: displayName, text: `Check out ${displayName}'s profile`, url });
        return;
      } catch {
        /* user cancelled → fallback to copy */
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      flash(setCopiedLink);
    } catch {
      window.prompt('Profile Link:', url);
    }
  };

  const handleCopyUid = async (uid: string) => {
    click();
    try {
      await navigator.clipboard.writeText(uid);
      flash(setCopiedUid);
    } catch {
      /* ignore */
    }
  };

  // Escape + body scroll lock
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== 'Escape') return;
      if (galleryOpen) setGalleryOpen(false);
      else close();
    };
    window.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [close, galleryOpen]);

  const aboutRows: [string, string, boolean][] = [
    ['About', str('about') || str('bio'), show('showAbout')],
    ['Hobby', str('hobby'), show('showHobby')],
    ['Dream', str('dream'), show('showDream')],
    ['Referred By', str('referredBy'), show('showReferredBy')],
  ];
  const visibleAbout = aboutRows.filter(([, v, ok]) => v && ok);

  const hasConnect =
    show('showSocial') && ((show('showInstagram') && instaHandle) || whatsappUrl || otherLinks.length > 0);

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={`${displayName} profile`}
      style={{ ...TOKENS, ...SANS, background: 'var(--ink)' }}
      className="fixed inset-0 z-50 overflow-y-auto overflow-x-hidden text-[color:var(--text)] select-none"
    >
      {/* Ambient gold glow + fine grain */}
      <div className="fixed inset-0 pointer-events-none" aria-hidden>
        <div
          className="absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[420px] opacity-[0.16] blur-[140px]"
          style={{ background: 'radial-gradient(circle, var(--gold) 0%, transparent 70%)' }}
        />
        <div
          className="absolute inset-0 opacity-[0.035] mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='120' height='120'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='.9' numOctaves='2'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
      </div>

      <motion.main
        variants={container}
        initial="hidden"
        animate="show"
        className="relative z-10 w-full max-w-md mx-auto min-h-screen px-5 pt-6 pb-16"
      >
        {/* ============ HEADER ============ */}
        <motion.header variants={item} className="flex items-center justify-between pb-8">
          <div className="flex items-center gap-2.5">
            <IconButton title="Home" onClick={close}>
              <Home className="w-4 h-4" strokeWidth={1.5} />
            </IconButton>
            <IconButton title="Share" onClick={handleShare}>
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-400" strokeWidth={2} />
              ) : (
                <Share2 className="w-4 h-4" strokeWidth={1.5} />
              )}
            </IconButton>
            {onOpenEditProfile && (
              <IconButton
                title="Edit Profile"
                onClick={() => {
                  click();
                  onOpenEditProfile();
                }}
              >
                <Edit3 className="w-4 h-4" strokeWidth={1.5} />
              </IconButton>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              click();
              onOpenCreateProfile ? onOpenCreateProfile() : onClose();
            }}
            className="pl-4 pr-5 py-2.5 rounded-full text-[10px] font-semibold tracking-[0.22em] uppercase text-[#14100A] flex items-center gap-1.5 hover:brightness-110 active:scale-95 transition-all cursor-pointer shadow-[0_6px_24px_rgba(201,165,92,0.25)]"
            style={{ background: 'linear-gradient(120deg, var(--gold-soft), var(--gold))' }}
          >
            <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
            Create Profile
          </button>
        </motion.header>

        {/* ============ HERO ============ */}
        <motion.section variants={item} className="flex flex-col items-center">
          <div className="relative w-56 h-72 sm:w-60 sm:h-76">
            {/* outer hairline arch */}
            <div
              className="absolute -inset-2 rounded-t-[140px] rounded-b-[22px] border border-[color:var(--line)]"
              aria-hidden
            />
            <button
              type="button"
              onClick={() => {
                click();
                if (avatarUrl) onOpenLightbox(avatarUrl);
              }}
              title="View full photo"
              className="group relative w-full h-full rounded-t-[130px] rounded-b-[16px] overflow-hidden bg-[color:var(--panel)] border border-[color:var(--line-strong)] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.9)] cursor-pointer active:scale-[0.99] transition-transform"
            >
              {avatarUrl && !avatarFailed ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  decoding="async"
                  onError={() => setAvatarFailed(true)}
                  className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.04]"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[color:var(--gold)]/50">
                  <User className="w-14 h-14" strokeWidth={0.8} />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </button>
          </div>

          <div className="mt-9 text-center flex flex-col items-center gap-3">
            <div className="flex items-center gap-2.5">
              <h1 className="text-[34px] leading-none font-light tracking-wide" style={{ ...SERIF, ...GOLD_TEXT }}>
                {displayName}
              </h1>
              <span className="text-[color:var(--gold)] text-[11px]" title="Verified" aria-label="Verified">
                ◆
              </span>
            </div>
            <div className="flex items-center gap-2.5 text-[10px] font-medium tracking-[0.3em] uppercase text-[color:var(--gold)]/90">
              <span>{roleTitle}</span>
              {tagline && (
                <>
                  <span className="text-[color:var(--gold)]/40">◆</span>
                  <span>{tagline}</span>
                </>
              )}
            </div>
          </div>
        </motion.section>

        {/* ============ 01 IDENTITY ============ */}
        <motion.section variants={item} className="mt-14">
          <SectionHeader num="01" title="Identity" />
          <div className="border-t border-b border-[color:var(--line)]">
            <Row label="Full Name">
              <span className="text-xl font-light" style={SERIF}>
                {displayName}
              </span>
            </Row>

            {friend.nickname && (
              <Row label="Nickname">
                <span className="text-sm font-light">{friend.nickname}</span>
              </Row>
            )}

            {show('showFreeFire') && (friend.ffName || friend.ffUid) && (
              <Row
                label="Free Fire"
                icon={<Flame className="w-3 h-3 text-[color:var(--gold)]" />}
                action={
                  friend.ffUid && (
                    <IconButton title="Copy UID" size="w-9 h-9" onClick={() => handleCopyUid(friend.ffUid!)}>
                      {copiedUid ? (
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" strokeWidth={1.5} />
                      )}
                    </IconButton>
                  )
                }
              >
                <span className="text-sm">{friend.ffName || 'Player'}</span>
                {friend.ffUid && (
                  <span className="ml-2 text-xs text-[color:var(--muted)] font-mono">UID {friend.ffUid}</span>
                )}
              </Row>
            )}

            {show('showPhone') && rawPhone && (
              <Row
                label="Mobile"
                action={
                  <IconButton
                    title={phoneVisible ? 'Hide number' : 'Reveal number'}
                    size="w-9 h-9"
                    onClick={() => setPhoneVisible((v) => !v)}
                  >
                    {phoneVisible ? (
                      <EyeOff className="w-4 h-4" strokeWidth={1.5} />
                    ) : (
                      <Eye className="w-4 h-4" strokeWidth={1.5} />
                    )}
                  </IconButton>
                }
              >
                <span className="text-sm font-mono tracking-wider">{phoneText}</span>
              </Row>
            )}

            {show('showLocation') && friend.location && (
              <Row label="Location" icon={<MapPin className="w-3 h-3 text-[color:var(--gold)]" />}>
                <span className="text-sm font-light">{friend.location}</span>
              </Row>
            )}

            {visibleAbout.map(([label, value]) => (
              <Row key={label} label={label}>
                <span className="text-sm font-light leading-relaxed">{value}</span>
              </Row>
            ))}
          </div>
        </motion.section>

        {/* ============ 02 GALLERY ============ */}
        {show('showGallery') && featured.length > 0 && (
          <motion.section variants={item} className="mt-14">
            <SectionHeader
              num="02"
              title="Gallery"
              right={
                photos.length > 4 && (
                  <button
                    type="button"
                    onClick={() => setGalleryOpen(true)}
                    className="text-[10px] tracking-[0.25em] uppercase text-[color:var(--gold)] hover:text-[color:var(--gold-soft)] transition-colors cursor-pointer whitespace-nowrap"
                  >
                    All {photos.length}
                  </button>
                )
              }
            />
            {/* एक बड़ा hero + तीन छोटे */}
            <div className="grid grid-cols-3 gap-3">
              <GalleryTile
                src={featured[0]}
                alt="Gallery 1"
                className="col-span-3 aspect-[16/11]"
                onClick={() => onOpenLightbox(featured[0])}
              />
              {featured.slice(1).map((src, i) => (
                <GalleryTile
                  key={`${src}-${i}`}
                  src={src}
                  alt={`Gallery ${i + 2}`}
                  className="aspect-square"
                  onClick={() => onOpenLightbox(src)}
                />
              ))}
            </div>
          </motion.section>
        )}

        {/* ============ 03 CONNECT ============ */}
        {hasConnect && (
          <motion.section variants={item} className="mt-14">
            <SectionHeader num="03" title="Connect" />
            <div className="flex flex-col gap-3">
              {show('showInstagram') && instaHandle && (
                <ConnectCard
                  icon={<InstagramIcon />}
                  label="Instagram"
                  value={`@${instaHandle}`}
                  href={`https://instagram.com/${instaHandle}`}
                  onClick={click}
                />
              )}
              {whatsappUrl && (
                <ConnectCard
                  icon={<WhatsappIcon />}
                  label="WhatsApp"
                  value="Send a message"
                  href={whatsappUrl}
                  onClick={() => sound.playSuccess()}
                />
              )}
              {otherLinks.map((link, i) => {
                const meta = getSocialBrandMeta(link);
                if (!meta.url) return null;
                return (
                  <ConnectCard
                    key={link.id || i}
                    icon={meta.icon || <Sparkles className="w-5 h-5" strokeWidth={1.5} />}
                    label={meta.label || 'Link'}
                    value="Open link"
                    href={meta.url}
                    onClick={click}
                  />
                );
              })}
            </div>
          </motion.section>
        )}

        {/* footer mark */}
        <motion.div variants={item} className="mt-16 flex justify-center text-[color:var(--gold)]/40 text-[10px] tracking-[0.5em]">
          ◆
        </motion.div>
      </motion.main>

      {/* ============ FULL GALLERY MODAL ============ */}
      <AnimatePresence>
        {galleryOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: EASE }}
            className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md overflow-y-auto p-5"
          >
            <div className="max-w-2xl mx-auto flex flex-col gap-6">
              <div className="flex items-center justify-between pb-4 border-b border-[color:var(--line)]">
                <span className="text-[10px] font-semibold tracking-[0.3em] uppercase">
                  {friend.name} · {photos.length}
                </span>
                <IconButton title="Close gallery" size="w-9 h-9" onClick={() => setGalleryOpen(false)}>
                  <X className="w-4 h-4" strokeWidth={1.5} />
                </IconButton>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {photos.map((p, i) => (
                  <GalleryTile
                    key={`${p}-${i}`}
                    src={p}
                    alt={`Photo ${i + 1}`}
                    className="aspect-square"
                    onClick={() => onOpenLightbox(p)}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default FriendHeroProfile3D;
