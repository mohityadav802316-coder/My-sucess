# PROJECT OVERVIEW: Remix Remix CyberMohit AI Portfolio

## 1. Executive Summary & Identity
- **Project Name:** Remix Remix CyberMohit AI Portfolio
- **Subject / Profile:** Mohit Yadav (Class 12 Science PCM Student, Bihar School Examination Board / BSEB; Aspiring AI Engineer, Python Developer, and Defensive Cybersecurity Builder)
- **Primary Design Concept:** Cinematic, bilingual 3D cyberpunk digital portfolio inspired by Doctor Strange and Wanda Maximoff (Scarlet Witch) Multiverse aesthetics, combined with futuristic HUD instrumentation and glowing neon accents.
- **Languages Supported:** Dual-language architecture: English (`en`) and Hindi (`hi`), switchable instantly via global reactive context without reloads.
- **Repository / Runtime:** Vite 8.3.0 + React 19.0.1 Single Page Application (SPA), styled with Tailwind CSS v4, Motion (Framer Motion v12), Three.js (WebGL 3D), and backed by Google Cloud Firestore and Firebase Storage.

---

## 2. Technology Stack & Framework Inventory

| Layer | Technology | Version | Purpose & Rationale |
|---|---|---|---|
| **Core Framework** | React | `^19.0.1` | Concurrent rendering, modern hooks, component lifecycle |
| **DOM Engine** | React DOM | `^19.0.1` | Client-side DOM mounting in `#root` |
| **Bundler & Dev Server** | Vite | `^8.3.0` | Ultra-fast ESM compilation, hot module reloading config |
| **Styling Engine** | Tailwind CSS & @tailwindcss/vite | `^4.3.3` | Next-generation CSS-first compiler via `@import "tailwindcss";` |
| **3D Rendering** | Three.js | `^0.186.1` | WebGL hardware-accelerated 3D meshes, particle clouds, optical lenses |
| **Motion & Animation** | Motion (Framer Motion) | `^12.23.24` | Gestures, scroll-linked animations, spring physics, layout morphs |
| **Cloud Database** | Firebase Firestore | `^13.0.0` | Real-time NoSQL synchronization with long-polling fallback |
| **Cloud Storage** | Firebase Storage | `^13.0.0` | Secure media uploads for portfolio, friend, and family photos |
| **Authentication** | Firebase Auth + Web Crypto | `^13.0.0` | Zero-Trust password hashing (SHA-256 + cryptographic salt) |
| **Icons** | Lucide React | `^0.546.0` | Clean vector icons for cybernetic HUD and admin controls |
| **Confetti VFX** | canvas-confetti | `^1.9.4` | Particle explosion bursts on guestbook and contact actions |
| **Audio Engine** | Web Audio API | Native Browser | Zero-asset procedural synthesizer for sci-fi UI sound effects |
| **Language & Typings**| TypeScript | `^7.0.2` | Strict compile-time safety and self-documenting data interfaces |

---

## 3. Architecture & Data Flow

```
                      +-----------------------------+
                      |          index.html         |
                      |   Fonts: Rajdhani, Orbitron |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |         src/main.tsx        |
                      +--------------+--------------+
                                     |
                                     v
                      +-----------------------------+
                      |         src/App.tsx         |
                      +--------------+--------------+
                                     |
          +--------------------------+--------------------------+
          |                                                     |
          v                                                     v
+--------------------+                                +--------------------+
|  LanguageProvider  |                                |   ImageProvider    |
| (Mode: en/hi/both) |                                | (Firestore Sync &  |
+--------------------+                                |  Local Fallbacks)  |
                                                      +--------------------+
                                                                |
       +--------------------------------------------------------+
       |
       +---> Global Background Layers:
       |     * CyberBackground (Canvas nodes & matrix web)
       |     * CinematicCanvas3D (Three.js 5-zone multiverse)
       |     * MysticTouchSparks (Interactive pointer spark bursts)
       |     * BackgroundMusic (Procedural/ambient soundtrack loop)
       |
       +---> Interactive HUD & Navigation:
       |     * CyberNavbar (Sticky header, brand mark, audio/lang toggles)
       |     * CinematicScrollHUD (Vertical scene timeline & jump buttons)
       |
       +---> Main Content Sections:
       |     01. HeroSection (3D Photo Orbit & Floating Flagship Phone)
       |     02. AboutSection (Class 12 BSEB credentials & domain badges)
       |     03. UniversalTechConsole (Interactive 3D lens & tech registry)
       |     04. CyberSecuritySection (Defensive matrix & live audit terminal)
       |     05. SkillsSection (Terminal matrix with proficiency meters)
       |     06. RoadmapSection (Chronological journey & vision)
       |     07. ProjectsSection (PinChat, LifeTracker & AI tool showcases)
       |     08. GallerySection (Obsidian 3D photo gallery & lightbox)
       |     09. GuestbookSection (Live visitor messages & confetti)
       |     10. VisionSection (Future aspirations & ethical AI creed)
       |     11. ContactSection (Encrypted link channels & direct form)
       |     12. Footer (Monogram MY mark, admin trigger, return to top)
       |
       +---> Modals & Portals:
             * FireballButton (Floating 3D Booyah trigger)
             * FriendsUniverse (Squad dossiers, Free Fire roster & categories)
             * FamilyVaultModal (Password-gated encrypted memory sanctuary)
             * AdminModal (Master command plane with 13 control modules)
```

---

## 4. Key Security & Resilience Directives
1. **Zero-Trust Access Control:** Admin console and Family Vault use Web Crypto API SHA-256 cryptographic salt + hash algorithms before data reaches Firebase.
2. **Iframe & Sandbox Compatibility:** Firestore is explicitly initialized with `experimentalAutoDetectLongPolling: true` to prevent WebChannel streaming disconnects within Cloud Run / AI Studio sandboxes.
3. **Storage Resilience:** `storage.maxUploadRetryTime` and `maxOperationRetryTime` are clamped to 4000ms to eliminate UI hangs during offline or restricted network environments.
4. **Client-Side Compression:** High-resolution mobile uploads (5MB - 12MB) are automatically compressed client-side via canvas before reaching Firebase Storage.
5. **No Blind Dependency on Remote Backend:** All sections provide fallback baseline datasets (`defaultProjects`, `defaultSkills`, `defaultMilestones`, `defaultFriendsList`, `defaultFamilyMembers`) ensuring 100% functionality even during zero-connectivity or fresh database deployments.
