import React from 'react';
import { FriendSocialLink } from '../data/friends';

export interface SocialBrandMeta {
  brandKey: string;
  label: string;
  url: string;
  icon: React.ReactNode;
  brandColor: string;
  badgeStyle: React.CSSProperties;
  badgeClassName: string;
}

/**
 * Clean & normalize social URLs (auto-fixing missing https:// or bare usernames)
 */
export function normalizeSocialUrl(rawUrl: string, platformHint = ''): string {
  if (!rawUrl || !rawUrl.trim()) return '';
  let url = rawUrl.trim();

  // If already full http(s) link
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }

  const cleanHandle = url.replace(/^@+/, '');

  switch (platformHint.toLowerCase()) {
    case 'instagram':
      return `https://instagram.com/${cleanHandle}`;
    case 'facebook':
      return `https://facebook.com/${cleanHandle}`;
    case 'youtube':
      return url.startsWith('youtube.com') || url.startsWith('youtu.be')
        ? `https://${url}`
        : `https://youtube.com/@${cleanHandle}`;
    case 'x':
    case 'twitter':
      return `https://x.com/${cleanHandle}`;
    case 'snapchat':
      return `https://snapchat.com/add/${cleanHandle}`;
    case 'github':
      return `https://github.com/${cleanHandle}`;
    case 'linkedin':
      return url.includes('linkedin.com')
        ? `https://${url}`
        : `https://linkedin.com/in/${cleanHandle}`;
    case 'telegram':
      return `https://t.me/${cleanHandle}`;
    case 'discord':
      return url.includes('discord.') ? `https://${url}` : `https://discord.gg/${cleanHandle}`;
    default:
      return `https://${url}`;
  }
}

/**
 * Detect brand platform automatically from URL string if 'custom' or mislabeled
 */
export function detectPlatformFromUrl(url: string): string {
  const lower = url.toLowerCase();
  if (lower.includes('instagram.com') || lower.includes('instagr.am')) return 'instagram';
  if (lower.includes('facebook.com') || lower.includes('fb.com') || lower.includes('fb.watch') || lower.includes('fb.me')) return 'facebook';
  if (lower.includes('youtube.com') || lower.includes('youtu.be')) return 'youtube';
  if (lower.includes('twitter.com') || lower.includes('x.com')) return 'x';
  if (lower.includes('snapchat.com')) return 'snapchat';
  if (lower.includes('github.com')) return 'github';
  if (lower.includes('linkedin.com')) return 'linkedin';
  if (lower.includes('t.me') || lower.includes('telegram.me') || lower.includes('telegram.org')) return 'telegram';
  if (lower.includes('discord.gg') || lower.includes('discord.com')) return 'discord';
  if (lower.includes('wa.me') || lower.includes('whatsapp.com')) return 'whatsapp';
  return 'custom';
}

/**
 * Return rich brand metadata, SVG icon, and distinct styling
 */
export function getSocialBrandMeta(link: FriendSocialLink): SocialBrandMeta {
  const rawUrl = link.url || '';
  const detected = detectPlatformFromUrl(rawUrl);
  const effectivePlatform =
    link.platform && link.platform !== 'custom' ? link.platform : detected;

  const resolvedUrl = normalizeSocialUrl(rawUrl, effectivePlatform);
  const customLabel = link.label?.trim();

  switch (effectivePlatform.toLowerCase()) {
    case 'instagram':
      return {
        brandKey: 'instagram',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Instagram',
        url: resolvedUrl,
        brandColor: '#E1306C',
        badgeClassName:
          'bg-gradient-to-r from-[#833ab4]/15 via-[#fd1d1d]/15 to-[#fcb045]/15 hover:from-[#833ab4]/30 hover:via-[#fd1d1d]/30 hover:to-[#fcb045]/30 text-[#f77737] hover:text-white border border-[#E1306C]/40 hover:border-[#E1306C] shadow-[0_0_12px_rgba(225,48,108,0.25)] hover:shadow-[0_0_20px_rgba(225,48,108,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
          </svg>
        ),
      };

    case 'facebook':
      return {
        brandKey: 'facebook',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Facebook',
        url: resolvedUrl,
        brandColor: '#1877F2',
        badgeClassName:
          'bg-[#1877F2]/15 hover:bg-[#1877F2] text-[#1877F2] hover:text-white border border-[#1877F2]/40 hover:border-[#1877F2] shadow-[0_0_12px_rgba(24,119,242,0.25)] hover:shadow-[0_0_20px_rgba(24,119,242,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M9 8H6v4h3v12h5V12h3.642L18 8h-4V6.333C14 5.374 14.5 5 15.5 5H18V0h-3.808C10.597 0 9 1.583 9 4.615V8z" />
          </svg>
        ),
      };

    case 'youtube':
      return {
        brandKey: 'youtube',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'YouTube',
        url: resolvedUrl,
        brandColor: '#FF0000',
        badgeClassName:
          'bg-[#FF0000]/15 hover:bg-[#FF0000] text-[#FF4444] hover:text-white border border-[#FF0000]/40 hover:border-[#FF0000] shadow-[0_0_12px_rgba(255,0,0,0.25)] hover:shadow-[0_0_20px_rgba(255,0,0,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
          </svg>
        ),
      };

    case 'x':
    case 'twitter':
      return {
        brandKey: 'x',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'X (Twitter)',
        url: resolvedUrl,
        brandColor: '#FFFFFF',
        badgeClassName:
          'bg-white/10 hover:bg-white text-slate-200 hover:text-black border border-white/30 hover:border-white shadow-[0_0_12px_rgba(255,255,255,0.2)] hover:shadow-[0_0_18px_rgba(255,255,255,0.5)]',
        badgeStyle: {},
        icon: (
          <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
          </svg>
        ),
      };

    case 'snapchat':
      return {
        brandKey: 'snapchat',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Snapchat',
        url: resolvedUrl,
        brandColor: '#FFFC00',
        badgeClassName:
          'bg-[#FFFC00]/15 hover:bg-[#FFFC00] text-[#FFFC00] hover:text-slate-950 border border-[#FFFC00]/40 hover:border-[#FFFC00] shadow-[0_0_12px_rgba(255,252,0,0.25)] hover:shadow-[0_0_20px_rgba(255,252,0,0.6)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12.001 0C6.93 0 4.15 3.32 4.15 6.64c0 1.54.49 2.76.99 3.7.13.25.17.47.08.68-.13.31-.59.73-1.63 1.07-.37.12-.59.43-.59.78 0 .46.39.81.98.81.42 0 .9-.13 1.45-.41.34-.17.65-.22.92-.09.31.14.73.53 1.55 1.56.57.72 1.35 1.7 3.09 1.7 1.74 0 2.52-.98 3.09-1.7.82-1.03 1.24-1.42 1.55-1.56.27-.13.58-.08.92.09.55.28 1.03.41 1.45.41.59 0 .98-.35.98-.81 0-.35-.22-.66-.59-.78-1.04-.34-1.5-.76-1.63-1.07-.09-.21-.05-.43.08-.68.5-.94.99-2.16.99-3.7C19.851 3.32 17.071 0 12.001 0z" />
          </svg>
        ),
      };

    case 'github':
      return {
        brandKey: 'github',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'GitHub',
        url: resolvedUrl,
        brandColor: '#E6EDF3',
        badgeClassName:
          'bg-slate-800/80 hover:bg-white text-slate-200 hover:text-slate-950 border border-slate-700 hover:border-white shadow-[0_0_12px_rgba(255,255,255,0.15)] hover:shadow-[0_0_20px_rgba(255,255,255,0.4)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
          </svg>
        ),
      };

    case 'linkedin':
      return {
        brandKey: 'linkedin',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'LinkedIn',
        url: resolvedUrl,
        brandColor: '#0A66C2',
        badgeClassName:
          'bg-[#0A66C2]/15 hover:bg-[#0A66C2] text-[#0A66C2] hover:text-white border border-[#0A66C2]/40 hover:border-[#0A66C2] shadow-[0_0_12px_rgba(10,102,194,0.25)] hover:shadow-[0_0_20px_rgba(10,102,194,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" />
          </svg>
        ),
      };

    case 'telegram':
      return {
        brandKey: 'telegram',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Telegram',
        url: resolvedUrl,
        brandColor: '#229ED9',
        badgeClassName:
          'bg-[#229ED9]/15 hover:bg-[#229ED9] text-[#229ED9] hover:text-white border border-[#229ED9]/40 hover:border-[#229ED9] shadow-[0_0_12px_rgba(34,158,217,0.25)] hover:shadow-[0_0_20px_rgba(34,158,217,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.946z" />
          </svg>
        ),
      };

    case 'discord':
      return {
        brandKey: 'discord',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Discord',
        url: resolvedUrl,
        brandColor: '#5865F2',
        badgeClassName:
          'bg-[#5865F2]/15 hover:bg-[#5865F2] text-[#5865F2] hover:text-white border border-[#5865F2]/40 hover:border-[#5865F2] shadow-[0_0_12px_rgba(88,101,242,0.25)] hover:shadow-[0_0_20px_rgba(88,101,242,0.55)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
            <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028c.462-.63.874-1.295 1.226-1.994.021-.041.001-.09-.041-.106a13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.929 1.793 8.18 1.793 12.061 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.893.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.028zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
          </svg>
        ),
      };

    default:
      return {
        brandKey: 'website',
        label: customLabel && customLabel !== 'Custom' ? customLabel : 'Website / Link',
        url: resolvedUrl,
        brandColor: '#00F2FE',
        badgeClassName:
          'bg-cyan-950/40 hover:bg-cyan-500 text-cyan-300 hover:text-slate-950 border border-cyan-500/40 hover:border-cyan-400 shadow-[0_0_12px_rgba(0,242,254,0.2)] hover:shadow-[0_0_20px_rgba(0,242,254,0.5)]',
        badgeStyle: {},
        icon: (
          <svg className="w-4 h-4 fill-none stroke-current stroke-2 shrink-0" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10" />
            <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
          </svg>
        ),
      };
  }
}
