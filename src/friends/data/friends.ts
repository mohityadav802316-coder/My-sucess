/**
 * ============================================================================
 * FRIENDS UNIVERSE DATA & TYPES DEFINITION (Firebase Integrated)
 * ============================================================================
 */

export interface FriendSocialLink {
  id?: string;
  platform: 'instagram' | 'facebook' | 'youtube' | 'x' | 'snapchat' | 'github' | 'linkedin' | 'portfolio' | 'telegram' | 'discord' | 'custom' | string;
  label: string;
  url: string;
  visible?: boolean;
}

export interface FriendPhoto {
  url: string;
  source?: 'url' | 'upload';
  path?: string; // Firebase Storage path
  alt?: string;
  caption?: string;
  visible?: boolean;
  order?: number;
}

export type PhotoInput = string | FriendPhoto;

/**
 * Universal resolver to get image URL from string or FriendPhoto
 * Translates Google Drive link-view formats if possible
 */
export function resolveImageUrl(photo: PhotoInput | null | undefined): string {
  if (!photo) return '';
  let url = typeof photo === 'string' ? photo : (photo.url || '');
  if (!url) return '';

  // Handle Google Drive share link conversion to direct image link
  // e.g. https://drive.google.com/file/d/FILE_ID/view?usp=sharing -> https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600
  if (url.includes('drive.google.com/file/d/')) {
    const match = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
    }
  } else if (url.includes('drive.google.com/open?id=')) {
    const match = url.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://drive.google.com/thumbnail?id=${match[1]}&sz=w1600`;
    }
  }

  return url;
}

export type CategoryKey = string;

export interface CategoryItem {
  key: string;
  label: string;
  shortLabel: string;
  emoji: string;
  description?: string;
  color?: string;
  enabled?: boolean;
  order?: number;
  isSpecialSquad?: boolean;
}

export interface Friend {
  id: string;
  name: string;
  nickname?: string | null;
  username?: string | null;
  user?: string | null; // backward compatibility
  fullName?: string | null;
  bio?: string | null;
  avatar: PhotoInput;
  heroPhotos: PhotoInput[];
  photos?: PhotoInput[]; // backward compatibility
  gallery: PhotoInput[];
  categories: string[];
  cats?: string[]; // backward compatibility
  ffName?: string | null;
  ffUid?: string | null;
  role?: string | null;
  dob?: string | null;
  dobShowYear?: boolean;
  whatsapp?: string | null;
  links: FriendSocialLink[];
  accent?: string; // Friend's custom hex accent color
  online: boolean | null; // null by default - real system not linked
  order: number;
  isVisible: boolean;
  isUnlisted?: boolean; // When true, hidden from public category tabs and all-friends listing, but accessible directly via ?friend=ID
  listingVisibility?: 'normal' | 'hidden';
  adminCategory?: 'normal' | 'hidden';
  createdAt?: any;
  updatedAt?: any;
  isDemo?: boolean;
  location?: string | null;
  city?: string | null;
  state?: string | null;
  hobbies?: string | null;
  hobby?: string | null;
  dream?: string | null;
  goal?: string | null;
  referredBy?: string | null;
  relation?: string | null;
  tagline?: string | null;
  skills?: string[] | string | null;
  projects?: string[] | string | null;
  phone?: string | null;
  isVerified?: boolean;
  instagram?: string | null;
  visibilitySettings?: FriendVisibilitySettings;
}

/**
 * Determines if a friend profile is an approved Normal friend eligible for public listing.
 * Returns false if the profile is Hidden, Unlisted, or marked not visible.
 */
export function isFriendPublic(friend: Friend | null | undefined): boolean {
  if (!friend) return false;
  if (friend.isUnlisted === true) return false;
  if (friend.listingVisibility === 'hidden') return false;
  if (friend.adminCategory === 'hidden') return false;
  if (friend.isVisible === false) return false;
  const cats = friend.categories || friend.cats || [];
  if (cats.includes('hidden') || cats.includes('unlisted')) return false;
  return true;
}

export interface FriendRequest {
  id: string; // e.g. REQ-NEW-timestamp or REQ-UPD-timestamp
  type: 'new_profile' | 'profile_update';
  profileId?: string; // Target friend ID if update
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: any;
  reviewedAt?: any;
  applicantName: string;
  applicantContact?: string;
  profileData: Partial<Friend>;
  originalData?: Partial<Friend>;
  adminCategory?: 'normal' | 'hidden';
  assignedCategories?: string[];
  adminNotes?: string;
}

export interface FriendVisibilitySettings {
  showFreeFire?: boolean;
  showPhone?: boolean;
  showLocation?: boolean;
  showHobby?: boolean;
  showDream?: boolean;
  showReferredBy?: boolean;
  showInstagram?: boolean;
  showGallery?: boolean;
  showSocial?: boolean;
  showAbout?: boolean;
  showSkillsCard?: boolean;
  showProjectsCard?: boolean;
  showHobbiesCard?: boolean;
  showDreamCard?: boolean;
  showBottomCards?: boolean;
}

export interface FriendsPrivateData {
  friendId: string;
  privateFields: Record<string, any>;
  notes?: string;
  updatedAt?: any;
}

export interface FriendsConfigSettings {
  publicSiteUrl?: string; // Production / Vercel public URL (e.g. "https://your-site.vercel.app")
  categories: CategoryItem[];
  features: {
    viewMore: boolean;
    gallery: boolean;
    search: boolean;
    shareButton: boolean;
    showDob: boolean;
    freeFireInfo: boolean;
    stars: boolean;
    shootingStars: boolean;
    gyroscope: boolean;
    name3DText: boolean;
  };
  effectsLevel: 'off' | 'medium' | 'high' | 'ultra';
  themeColors: {
    bg: string;
    glass: string;
    primary: string;
    accent: string;
    gold: string;
    magenta: string;
    lime: string;
    orange: string;
  };
  labels: {
    allFriendsTitleHi: string;
    allFriendsTitleEn: string;
    subtitleHi: string;
    subtitleEn: string;
    searchPlaceholderHi: string;
    searchPlaceholderEn: string;
    onlineNoteHi: string;
    onlineNoteEn: string;
    emptyFriendsHi: string;
    emptyFriendsEn: string;
    errorTitleHi: string;
    errorTitleEn: string;
  };
  updatedAt?: any;
}

export const DEFAULT_CATEGORIES: CategoryItem[] = [
  { key: 'all', label: 'All Friends', shortLabel: 'All', emoji: '👥', color: '#00F2FE', enabled: true, order: 0 },
  { key: 'prefer', label: 'Prefer', shortLabel: 'Prefer', emoji: '⭐', color: '#38BDF8', enabled: true, order: 1 },
  { key: 'squad', label: 'MY SQUAD', shortLabel: 'SQUAD', emoji: '👑', color: '#FFB53D', enabled: true, order: 2, isSpecialSquad: true },
  { key: 'ff', label: 'Free Fire', shortLabel: 'Free Fire', emoji: '🔥', color: '#FF7A2F', enabled: true, order: 3 },
  { key: 'online', label: 'Online', shortLabel: 'Online', emoji: '🟢', color: '#10B981', enabled: true, order: 4 },
  { key: 'digital', label: 'Digital', shortLabel: 'Digital', emoji: '🌐', color: '#9B5CFF', enabled: true, order: 5 },
];

export const DEFAULT_FRIENDS_SETTINGS: FriendsConfigSettings = {
  publicSiteUrl: '',
  categories: DEFAULT_CATEGORIES,
  features: {
    viewMore: true,
    gallery: true,
    search: true,
    shareButton: true,
    showDob: true,
    freeFireInfo: true,
    stars: true,
    shootingStars: true,
    gyroscope: true,
    name3DText: true,
  },
  effectsLevel: 'high',
  themeColors: {
    bg: '#0A0D14',
    glass: '#111726',
    primary: '#00F2FE',
    accent: '#9B5CFF',
    gold: '#FFB53D',
    magenta: '#FF2BD6',
    lime: '#B6FF2B',
    orange: '#FF6A00',
  },
  labels: {
    allFriendsTitleHi: 'Friends Universe',
    allFriendsTitleEn: 'Friends Universe',
    subtitleHi: '3D होलोग्राफिक नेटवर्क • इंटरएक्टिव डॉक',
    subtitleEn: '3D Holographic Network • Interactive Dock',
    searchPlaceholderHi: 'दोस्त खोजें (Search Friends)...',
    searchPlaceholderEn: 'Search friends...',
    onlineNoteHi: 'Online status का असली system अभी जुड़ा नहीं है, इसलिए status उपलब्ध नहीं।',
    onlineNoteEn: 'Real online status tracking is not connected yet, status unavailable.',
    emptyFriendsHi: 'अभी कोई दोस्त नहीं है।',
    emptyFriendsEn: 'No friends found.',
    errorTitleHi: 'Firebase से डेटा लोड करने में समस्या आई।',
    errorTitleEn: 'Failed to load friends from Firebase.',
  },
};
