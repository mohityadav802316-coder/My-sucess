# FILE INVENTORY: Remix Remix CyberMohit AI Portfolio

This inventory catalogs every source file, configuration file, and asset definition in the repository.

---

## 1. Root & Configuration Files

| File Path | Purpose | Key Exports / Settings | Dependencies / Integrations |
|---|---|---|---|
| `package.json` | Project manifest, dependencies, scripts | `"dev"`, `"build"`, `"lint"` | React 19, Three.js, Firebase 13, Motion 12, Tailwind v4 |
| `vite.config.ts` | Vite bundler build and dev server config | React plugin, Tailwind plugin, `@/` alias | `@vitejs/plugin-react`, `@tailwindcss/vite` |
| `tsconfig.json` | TypeScript compiler rules | Target: ES2022, JSX: react-jsx, bundler module resolution | TypeScript 7 |
| `index.html` | HTML entry point, SEO meta tags, Google Fonts | OpenGraph tags, Google Fonts: Rajdhani, Orbitron, Noto Sans | External CDN fonts |
| `metadata.json` | AI Studio application manifest | App name, description, capabilities | Platform metadata engine |
| `firebase-applet-config.json` | Client Firebase credentials | `projectId`, `apiKey`, `firestoreDatabaseId`, `storageBucket` | Firebase SDK |
| `firestore.rules` | Security rules for Cloud Firestore | Role-based & schema-restricted access controls | Cloud Firestore |
| `storage.rules` | Security rules for Firebase Cloud Storage | Authenticated/admin upload & read permissions | Firebase Storage |
| `.env.example` | Template for environment variables | `GEMINI_API_KEY`, `APP_URL` | Cloud Run environment |

---

## 2. Core Application Entry & Contexts (`src/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/main.tsx` | React 19 root bootstrap | `createRoot(document.getElementById('root'))` | `react-dom/client`, `App.tsx`, `index.css` |
| `src/App.tsx` | Master application view orchestration | `default function App()` | All context providers, background 3D, sections, modals |
| `src/index.css` | Global styling, Tailwind v4 layers, custom scrolls | Cyberpunk glowing utilities, animations, custom scrollbars | `@import "tailwindcss";` |
| `src/types.ts` | Global TypeScript domain interfaces | `SiteSettings`, `PortfolioImage`, `FriendItem`, `FamilyMember`, `UniversalTechItem`, etc. | Core domain types |
| `src/firebase.ts` | Firebase initialization & Firestore error handler | `db`, `auth`, `storage`, `googleProvider`, `handleFirestoreError` | `firebase/app`, `firebase/firestore`, `firebase/auth`, `firebase/storage` |
| `src/context/LanguageContext.tsx` | Bilingual reactivity (English & Hindi) | `LanguageProvider`, `useLanguage` | React Context API |
| `src/context/ImageContext.tsx` | Real-time Firebase data synchronization & offline cache | `ImageProvider`, `useImages`, `defaultProjects`, `defaultSkills`, `defaultMilestones`, `defaultSiteSettings` | Firestore listeners, React Context API |

---

## 3. Utilities & Data (`src/utils/`, `src/data/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/utils/crypto.ts` | Zero-dependency salted password hashing | `hashPasswordWithSalt` | Web Crypto API (`crypto.subtle.digest`) |
| `src/utils/imageCompressor.ts` | Client-side photo canvas compressor | `compressImage` | HTMLCanvasElement, FileReader API |
| `src/utils/seo.ts` | Dynamic document title and meta tag synchronizer | `updateMetaTag`, `useSeoSync` | DOM API |
| `src/data/universalTechRegistry.ts` | 3D Technology console database | `UNIVERSAL_TECH_REGISTRY`, `UNIVERSAL_TECH_CATEGORIES` | TypeScript interfaces |

---

## 4. Audio Engine (`src/components/audio/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/audio/SoundEffects.ts` | Procedural Web Audio API sound synthesizer | `sound` (instance of `SoundEffectsManager`) | Native Browser AudioContext |
| `src/components/audio/BackgroundMusic.tsx` | Ambient looping soundtrack with auto-start on touch | `BackgroundMusic` | `HTMLAudioElement`, `useImages`, `sound` |

---

## 5. Three.js 3D Components (`src/components/three/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/three/CinematicCanvas3D.tsx` | 5-Zone Multiverse 3D background with scroll reactive camera | `CinematicCanvas3D` | Three.js (Scene, PerspectiveCamera, WebGLRenderer, Points, ShaderMaterial) |
| `src/components/three/FloatingPhoneHero3D.tsx` | 3D flagship mobile phone with portrait screen texture | `FloatingPhoneHero3D` | Three.js, `RoomEnvironment` |
| `src/components/three/PhotoOrbitHero3D.tsx` | Dual-mode hero 3D orbit system (Phone + satellite photo cards) | `PhotoOrbitHero3D` | Three.js, `RoomEnvironment`, `sound` |
| `src/components/three/CyberCore3D.tsx` | Interactive 3D quantum gyroscope / tech orb | `CyberCore3D` | Three.js, `RoomEnvironment`, `sound` |
| `src/components/three/FriendsOrb3D.tsx` | 3D rotating squad orb preview | `FriendsOrb3D` | Three.js, `sound` |
| `src/components/three/Lens3DViewer.tsx` | 3D optical camera lens with dynamic refraction & brand lighting | `Lens3DViewer` | Three.js (MeshPhysicalMaterial, DirectionalLight) |
| `src/components/three/SquadLensViewer.tsx` | 3D holographic lens viewer for squad member cards | `SquadLensViewer` | Three.js, TextureLoader |

---

## 6. VFX & Animation Components (`src/components/vfx/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/vfx/MysticTextReveal.tsx` | Character-by-character animated text reveal with magic theme | `MysticTextReveal` | Motion (`motion/react`) |
| `src/components/vfx/MagicalTextReveal.tsx` | Staggered particle glowing text reveal | `MagicalTextReveal` | Motion (`motion/react`), `sound` |
| `src/components/vfx/MysticTiltCard.tsx` | 3D perspective mouse & touch tilt card with spotlight sheen | `MysticTiltCard` | CSS 3D transforms, mouse/touch event listeners |
| `src/components/vfx/MagicTiltCard.tsx` | Mystic circular runes tilt card | `MagicTiltCard` | CSS 3D transforms, pointer tracking |
| `src/components/vfx/MysticTouchSparks.tsx` | Multiverse spark particle generator on pointer/touch | `MysticTouchSparks` | HTMLCanvasElement, requestAnimationFrame |
| `src/components/vfx/MagicTouchBurst.tsx` | Secondary high-density touch spark burst | `MagicTouchBurst` | HTMLCanvasElement, `sound` |
| `src/components/vfx/BlackMagicSmoke.tsx` | Wanda crimson chaos smoke atmosphere | `BlackMagicSmoke` | CSS keyframe animations, Canvas |
| `src/components/vfx/FireballButton.tsx` | Floating 3D procedural dancing flame Booyah button | `FireballButton` | Motion (`motion/react`), `sound` |
| `src/components/vfx/IntroScreen.tsx` | "Exploded view" missile word assembly entrance intro | `IntroScreen` | Motion (`motion/react`), `sound` |
| `src/components/vfx/PremiumBrandLogo.tsx` | High-fidelity vector SVG marks for technologies | `PremiumBrandLogo` | Inline SVGs |

---

## 7. Layout & Navigation (`src/components/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/CyberNavbar.tsx` | Sticky glassmorphic header with language, audio, & modal triggers | `CyberNavbar` | Lucide icons, `useLanguage`, `sound` |
| `src/components/CinematicScrollHUD.tsx` | Floating right-side vertical scene progress HUD | `CinematicScrollHUD` | Lucide icons, `sound` |
| `src/components/CyberBackground.tsx` | Background matrix grid with connecting particle nodes | `CyberBackground` | Canvas 2D context |

---

## 8. Page Sections (`src/components/sections/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/sections/HeroSection.tsx` | Top hero presentation with 3D photo orbit & CTA links | `HeroSection` | `FloatingPhoneHero3D`, `MysticTextReveal`, `useLanguage`, `useImages` |
| `src/components/sections/AboutSection.tsx` | Academic BSEB Class 12 credentials & 6 domain badges | `AboutSection` | `MysticTextReveal`, `MysticTiltCard`, `useLanguage`, `useImages` |
| `src/components/sections/UniversalTechConsole.tsx` | Interactive 3D tech registry with search & optical lens | `UniversalTechConsole` | `Lens3DViewer`, `PremiumBrandLogo`, `universalTechRegistry` |
| `src/components/sections/CyberSecuritySection.tsx` | Defensive cybersecurity matrix & live audit terminal | `CyberSecuritySection` | `MysticTextReveal`, `MysticTiltCard`, `sound` |
| `src/components/sections/SkillsSection.tsx` | Terminal proficiency matrix & categorised skills | `SkillsSection` | `useLanguage`, `useImages`, `sound` |
| `src/components/sections/RoadmapSection.tsx` | Chronological milestones timeline (2024 to 2026+) | `RoadmapSection` | `useLanguage`, `useImages`, `MysticTextReveal` |
| `src/components/sections/ProjectsSection.tsx` | Applications portfolio (PinChat, Life Tracker, AI Tools) | `ProjectsSection` | `useLanguage`, `useImages`, `sound` |
| `src/components/sections/GallerySection.tsx` | Obsidian 3D photo gallery with lightbox viewer | `GallerySection` | `useLanguage`, `useImages`, `sound` |
| `src/components/sections/GuestbookSection.tsx` | Live visitor message submissions & confetti celebration | `GuestbookSection` | Firestore, `canvas-confetti`, `sound` |
| `src/components/sections/VisionSection.tsx` | Future aspirations, ethics & AI engineering vision | `VisionSection` | `useLanguage`, `MysticTextReveal` |
| `src/components/sections/ContactSection.tsx` | Contact channels, encrypted token copy, direct message form | `ContactSection` | Firestore, `canvas-confetti`, `sound` |
| `src/components/sections/Footer.tsx` | Brand mark, copyright, admin trigger, back to top | `Footer` | `useLanguage`, `sound` |

---

## 9. Friends Subsystem (`src/components/friends/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/friends/FriendsUniverse.tsx` | Friends Multiverse modal with categories & search | `FriendsUniverse`, `defaultFriendCategories`, `defaultFriendsList` | Firestore, `FriendProfileModal`, `FriendHeroProfile`, `sound` |
| `src/components/friends/FriendHeroProfile.tsx` | 3D flagship phone view of friend dossier | `FriendHeroProfile` | `FloatingPhoneHero3D`, `FriendGalleryModal`, `sound` |
| `src/components/friends/FriendProfileModal.tsx` | Quick card modal with social links & good qualities | `FriendProfileModal` | `MysticTiltCard`, `sound` |
| `src/components/friends/FriendGalleryModal.tsx` | Multi-photo lightbox gallery for friend photos | `FriendGalleryModal` | Touch swipe handlers, `sound` |
| `src/components/friends/MySquadSection.tsx` | Dedicated Free Fire battle squad roster | `MySquadSection` | `SquadLensViewer`, `sound`, `useImages` |

---

## 10. Family Vault Subsystem (`src/components/family/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/family/FamilyVaultModal.tsx` | Password-gated encrypted family sanctuary | `FamilyVaultModal`, `defaultFamilyMembers` | `crypto.ts`, Firestore, `FamilyMemberHeroProfile`, `sound` |
| `src/components/family/FamilyMemberHeroProfile.tsx` | Respectful 3D profile for family members | `FamilyMemberHeroProfile` | `FloatingPhoneHero3D`, `sound` |

---

## 11. Admin Control Plane Subsystem (`src/components/admin/`)

| File Path | Purpose | Key Exports | Primary Imports / Dependencies |
|---|---|---|---|
| `src/components/admin/AdminModal.tsx` | Password-gated master admin dashboard (PIN `802316`) | `AdminModal` | All 13 Admin managers, `crypto.ts`, `sound` |
| `src/components/admin/AdminSkillsManager.tsx` | Full CRUD for technical skills matrix | `AdminSkillsManager` | `useImages`, `sound` |
| `src/components/admin/AdminProjectManager.tsx` | Full CRUD for project portfolio entries | `AdminProjectManager` | `useImages`, `sound` |
| `src/components/admin/AdminJourneyManager.tsx` | Full CRUD for roadmap milestones | `AdminJourneyManager` | `useImages`, `sound` |
| `src/components/admin/AdminImagesManager.tsx` | Media manager, 3D orbit assignment & image upload | `AdminImagesManager` | `imageCompressor.ts`, Firebase Storage, Firestore |
| `src/components/admin/AdminFriendsManager.tsx` | Full CRUD for friends, categories, and Free Fire squad banner | `AdminFriendsManager` | `imageCompressor.ts`, Firestore, Firebase Storage |
| `src/components/admin/AdminFamilyManager.tsx` | Full CRUD for family members and vault password setup | `AdminFamilyManager` | `crypto.ts`, `imageCompressor.ts`, Firestore |
| `src/components/admin/AdminContentManager.tsx` | Full customization of bio, academic board, & bilingual titles | `AdminContentManager` | `useImages`, `sound` |
| `src/components/admin/AdminThemeCustomizer.tsx` | Customization of neon colors, glow intensity, audio defaults | `AdminThemeCustomizer` | `useImages`, `sound` |
| `src/components/admin/AdminAudioManager.tsx` | Background music URL, volume, looping controls | `AdminAudioManager` | `useImages`, `sound` |
| `src/components/admin/AdminContactManager.tsx` | Contact channels, socials, response availability | `AdminContactManager` | `useImages`, `sound` |
| `src/components/admin/AdminGuestbookManager.tsx` | Moderation and review of visitor messages | `AdminGuestbookManager` | Firestore, `sound` |
| `src/components/admin/AdminSecurityManager.tsx` | Zero-Trust PIN updates & cryptographic status | `AdminSecurityManager` | `crypto.ts`, Firestore, `sound` |
| `src/components/admin/AdminBackupManager.tsx` | 1-click JSON backup export and restore | `AdminBackupManager` | `useImages`, `sound` |
