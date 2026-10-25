export type LanguageMode = 'both' | 'en' | 'hi';

export interface VisitorMessage {
  id: string;
  name: string;
  email?: string;
  message: string;
  createdAt?: string | { seconds: number; nanoseconds: number } | any;
  read: boolean;
  archived?: boolean;
  source?: string;
}

export interface GuestbookEntry {
  id: string;
  name: string;
  message: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt?: string | { seconds: number; nanoseconds: number } | any;
  reviewedAt?: string | { seconds: number; nanoseconds: number } | any;
  deviceToken?: string;
}

export interface ProjectItem {
  id: string;
  title: string;
  titleHi: string;
  subtitle: string;
  subtitleHi: string;
  description: string;
  descriptionHi: string;
  status: 'Active' | 'Done' | 'In Progress' | 'Concept' | 'Active Development' | 'Live Showcase';
  statusHi: 'सक्रिय' | 'पूर्ण' | 'कार्य प्रगति पर' | 'प्रारूप' | 'विकास में' | 'लाइव शोकेस';
  tags: string[];
  features: string[];
  featuresHi: string[];
  targetOutcome: string;
  targetOutcomeHi: string;
  liveUrl?: string;
  githubUrl?: string;
  imageUrl?: string;
  isAvailable: boolean;
  accentColor?: string;
  order?: number;
}

export interface SkillItem {
  id?: string;
  name: string;
  nameHi: string;
  category: 'current' | 'tools' | 'learning';
  icon: string;
  description: string;
  descriptionHi: string;
  highlights: string[];
  proficiency?: number; // 0-100% for 3D glowing ring/meter
}

export interface RoadmapMilestone {
  id: string;
  phase: string;
  title: string;
  titleHi: string;
  status: 'completed' | 'in-progress' | 'future';
  statusText: string;
  statusTextHi: string;
  description: string;
  descriptionHi: string;
  topics: string[];
  yearMonth?: string;
  order?: number;
}

export interface GalleryItem {
  id: string;
  title: string;
  titleHi: string;
  category: 'setup' | 'ai_creation' | 'coding' | 'blueprint' | 'personal';
  categoryLabel: string;
  categoryLabelHi: string;
  imageUrl: string;
  caption: string;
  captionHi: string;
  isPlaceholder: boolean;
}

export interface PortfolioImage {
  id: string;
  title?: string;
  caption: string;
  captionHi?: string;
  downloadUrl: string;
  storagePath: string;
  section: 'profile' | 'about' | 'gallery' | 'roadmap' | 'hero';
  category: 'personal' | 'setup' | 'ai_creation' | 'coding' | 'blueprint';
  displayOrder: number;
  isPublished: boolean;
  isMainProfile: boolean;
  isHeroOrbit?: boolean;
  orbitIndex?: number;
  createdAt: any;
  updatedAt?: any;
}


export interface ProfileSettings {
  name: string;
  title: string;
  titleHi: string;
  bioEn: string;
  bioHi: string;
  education: string;
  educationHi: string;
  academicBoard: string;
  targetRole: string;
  targetRoleHi: string;
  careerGoalsEn: string[];
  careerGoalsHi: string[];
}

export interface HeroSettings {
  heroTitle: string;
  heroSubtitle: string;
  heroBioEn: string;
  heroBioHi: string;
  orbitCycleInterval: number; // in seconds
  autoRotateSpeed: number; // 0 to 2
  enable3DPhotoOrbit: boolean;
  enableQuantumCore: boolean;
  primaryPhotoId?: string;
  orbitImageIds: string[]; // up to 5 IDs
  particlesEnabled: boolean;
}

export interface ThemeSettings {
  neonColor: 'cyan' | 'magenta' | 'purple' | 'emerald';
  glowIntensity: 'subtle' | 'balanced' | 'high';
  fontFamily: 'rajdhani' | 'orbitron' | 'sans';
  backgroundStyle: 'grid' | 'particles' | 'cyber_matrix';
  soundEnabledByDefault: boolean;
  lowEffectsByDefault?: boolean;
  defaultLanguage?: 'en' | 'hi';
}

export interface SceneSettings {
  activeScenes: {
    hero: boolean;
    techConsole?: boolean;
    cybersecurity?: boolean;
    about: boolean;
    skills: boolean;
    roadmap: boolean;
    projects: boolean;
    gallery: boolean;
    vision: boolean;
    guestbook?: boolean;
    contact: boolean;
  };
  sceneOrder: ('hero' | 'techConsole' | 'cybersecurity' | 'about' | 'skills' | 'roadmap' | 'projects' | 'gallery' | 'vision' | 'guestbook' | 'contact')[];
}

export interface ContactSettings {
  email: string;
  githubUrl: string;
  telegramUrl?: string;
  linkedinUrl?: string;
  twitterUrl?: string;
  location: string;
  locationHi: string;
  responseAvailability: string;
  responseAvailabilityHi: string;
  whatsappNumber?: string;
  instagramUrl?: string;
  phoneNumber?: string;
  isPhonePublic?: boolean;
}

export interface SeoSettings {
  metaTitle?: string;
  metaDescription?: string;
  metaDescriptionHi?: string;
  ogImageUrl?: string;
  keywords?: string;
}

// Configurable section copy so that no text is hardcoded in the codebase
export interface SectionTexts {
  aboutTitle?: string;
  aboutTitleHi?: string;
  aboutSubtitle?: string;
  aboutSubtitleHi?: string;
  academicTitle?: string;
  academicTitleHi?: string;
  academicDesc?: string;
  academicDescHi?: string;
  visionTitle?: string;
  visionTitleHi?: string;
  visionDesc?: string;
  visionDescHi?: string;
  cyberTitle?: string;
  cyberTitleHi?: string;
  cyberSubtitle?: string;
  cyberSubtitleHi?: string;
  galleryTitle?: string;
  galleryTitleHi?: string;
  gallerySubtitle?: string;
  gallerySubtitleHi?: string;
  skillsTitle?: string;
  skillsTitleHi?: string;
  skillsSubtitle?: string;
  skillsSubtitleHi?: string;
  roadmapTitle?: string;
  roadmapTitleHi?: string;
  roadmapSubtitle?: string;
  roadmapSubtitleHi?: string;
  projectsTitle?: string;
  projectsTitleHi?: string;
  projectsSubtitle?: string;
  projectsSubtitleHi?: string;
  contactTitle?: string;
  contactTitleHi?: string;
  contactSubtitle?: string;
  contactSubtitleHi?: string;
}

export interface MusicSettings {
  enabled: boolean;
  audioUrl: string;
  storagePath?: string;
  volume: number; // 0.0 to 1.0 (e.g. 0.35)
  title?: string;
  loop: boolean;
  fadeInSeconds: number; // e.g. 3
}

export interface MagicSmokeSettings {
  enabled: boolean;
  intensity: 'off' | 'low' | 'medium' | 'high';
  colors?: string[]; // e.g. ['#ef4444', '#a855f7', '#f59e0b', '#3b82f6']
}

export interface ExplodedIntroSettings {
  enabled: boolean; // toggle intro on/off from Admin
}

export interface FamilyMember {
  id: string;
  name: string;
  nameHi?: string;
  relation: string; // e.g. 'Father', 'Mother', 'Brother', 'Sister', 'Grandfather', 'Grandmother', 'Family'
  relationHi?: string;
  bio?: string;
  bioHi?: string;
  photoUrl: string;
  storagePath?: string;
  photos?: string[]; // Multiple photos for "View More" 3D gallery
  order: number;
  createdAt?: any;
  updatedAt?: any;
}

export interface FamilyVaultSettings {
  hasPasswordSet: boolean;
  passwordSalt?: string;
  passwordHash?: string; // SHA-256(password + salt)
  updatedAt?: any;
}

export interface SiteSettings {
  profile: ProfileSettings;
  hero: HeroSettings;
  theme: ThemeSettings;
  scenes: SceneSettings;
  contact: ContactSettings;
  seo?: SeoSettings;
  music?: MusicSettings;
  magicSmoke?: MagicSmokeSettings;
  explodedIntro?: ExplodedIntroSettings;
  familyVault?: FamilyVaultSettings;
  lowDataMode?: boolean;
  sectionTexts?: SectionTexts;
  projects?: ProjectItem[];
  skills?: SkillItem[];
  milestones?: RoadmapMilestone[];
  isDraft?: boolean;
  lastPublishedAt?: any;
  updatedAt?: any;
  // Backward compatibility fields
  heroTitle?: string;
  heroSubtitle?: string;
  heroBioEn?: string;
  heroBioHi?: string;
  orbitCycleInterval?: number;
  themeColor?: 'cyan' | 'magenta' | 'purple' | 'emerald';
  activeScenes?: {
    hero: boolean;
    about: boolean;
    skills: boolean;
    projects: boolean;
    gallery: boolean;
    vision: boolean;
    contact: boolean;
  };
}
