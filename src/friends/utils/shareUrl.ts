/**
 * Universal Public Share URL Helper for Friends Universe
 *
 * Prevents sharing private Google AI Studio development container URLs (ais-dev-*.run.app)
 * which require Google AI Studio developer authentication.
 * Automatically resolves the clean public Vercel domain or custom domain.
 */

export const STORAGE_KEY_PUBLIC_SITE_URL = 'cybermohit_public_site_url';

export function getStoredPublicSiteUrl(): string {
  if (typeof window === 'undefined') return '';
  try {
    return localStorage.getItem(STORAGE_KEY_PUBLIC_SITE_URL)?.trim() || '';
  } catch {
    return '';
  }
}

export function setStoredPublicSiteUrl(url: string): void {
  if (typeof window === 'undefined') return;
  try {
    const clean = url.trim().replace(/\/+$/, '');
    if (clean) {
      localStorage.setItem(STORAGE_KEY_PUBLIC_SITE_URL, clean);
    } else {
      localStorage.removeItem(STORAGE_KEY_PUBLIC_SITE_URL);
    }
  } catch {}
}

export function isAiStudioDevUrl(): boolean {
  if (typeof window === 'undefined') return false;
  return window.location.origin.includes('ais-dev-');
}

/**
 * Builds the direct share URL for an individual friend profile.
 * Format: https://your-site.vercel.app/?friend=fr_12345
 */
export function getFriendShareUrl(friendId: string, configSiteUrl?: string): string {
  if (typeof window === 'undefined') return `/?friend=${encodeURIComponent(friendId)}`;

  let base = '';

  // 1. High priority: Configured Vercel/Public URL from Firestore settings
  if (configSiteUrl && configSiteUrl.trim().startsWith('http')) {
    base = configSiteUrl.trim().replace(/\/+$/, '');
  }

  // 2. LocalStorage override if set by Admin
  if (!base) {
    const stored = getStoredPublicSiteUrl();
    if (stored && stored.startsWith('http')) {
      base = stored.replace(/\/+$/, '');
    }
  }

  // 3. Fallback to current browser origin
  if (!base) {
    base = window.location.origin;
    const path = window.location.pathname.replace(/\/+$/, '');
    if (path) {
      base = `${base}${path}`;
    }
  }

  return `${base}/?friend=${encodeURIComponent(friendId)}`;
}

/**
 * Universal copy helper with clipboard and fallback support
 */
export async function copyFriendShareUrl(
  friendId: string,
  configSiteUrl?: string
): Promise<{ success: boolean; url: string; isAiStudioDev: boolean }> {
  const url = getFriendShareUrl(friendId, configSiteUrl);
  const isDev = isAiStudioDevUrl() && !configSiteUrl && !getStoredPublicSiteUrl();

  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(url);
      return { success: true, url, isAiStudioDev: isDev };
    }
  } catch {}

  try {
    window.prompt('Profile Link:', url);
    return { success: true, url, isAiStudioDev: isDev };
  } catch {
    return { success: false, url, isAiStudioDev: isDev };
  }
}
