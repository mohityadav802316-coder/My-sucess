# CyberMohit AI 3D Portfolio Import & Firebase Integration

Import and configure the complete bilingual (English/Hindi) 3D cyberpunk digital portfolio for Mohit Yadav from the uploaded archive, integrating live Firebase Firestore, Authentication, and hardware-accelerated Three.js scenes with zero-trust security.

### User Review & Critical Decisions

> [!IMPORTANT]
> The following recommended architectural choices will be enacted during execution:
> - **Firebase Backend**: Enable live Firebase Cloud Firestore and Firebase Authentication with security rules for public visitor guestbook submissions, contact inquiries, and authenticated admin content management.
> - **Zero-Trust Admin Authentication**: Support Firebase Authentication using authorized administrator email credentials (`mohityadav802316@gmail.com`, `yadavshiv16478@gmail.com`) with role verification against Firestore.
> - **Three.js Performance & Reliability**: Retain the 5-zone Multiverse 3D background canvas, 3D flagship smartphone chassis, and 3D optical lens viewer with ACESFilmic tone mapping, RoomEnvironment reflections, and procedural fallbacks for all external textures to eliminate CORS/404 errors.
> - **Offline Resilience**: Maintain complete baseline fallbacks (`defaultProjects`, `defaultSkills`, `defaultFriendsList`, `defaultFamilyMembers`) so the application renders cleanly and without errors even if network connectivity is interrupted.

---

### 1. Overview & Core Concept

- **What It Does**: A cinematic, bilingual (English & Hindi) digital portfolio showcasing Mohit Yadav's background (BSEB Class 12 Science PCM student, aspiring AI Engineer, Python developer, and defensive cybersecurity builder). It features interactive 3D WebGL scenes, real-time technology consoles, Free Fire squad dossiers in "Friends Universe", password-protected "Family Vault", and a visitor uplink guestbook.
- **Target Audience / Persona**: Tech recruiters, engineering peers, collaborators, mentors, and friends exploring Mohit's technical accomplishments and journey.
- **Key Value**: Delivers a memorable, futuristic visual presence while providing full admin content management for projects, skills, roadmap milestones, and photo uploads.

---

### 2. User Experience & Visual Design

- **Key User Flows**:
  1. *Visitor Exploration*: Lands on deep obsidian viewport with ambient cyber nodes and optional kinetic typography intro; scrolls through 10 synchronized scenes (Hero with 3D phone orbit, About with BSEB credentials, Universal Tech Console with 3D optical lens, Cyber Security terminal simulation, Skills with 3D meters, Roadmap timeline, Projects matrix, 3D Gallery, Guestbook, and Contact uplink).
  2. *Bilingual Toggle*: Instant single-click toggle between English (`ENG`) and Hindi (`हिंदी`) updates all section headings, role badges, descriptions, and buttons reactively without reload.
  3. *Visitor Guestbook & Contact Form*: Visitors submit short notes (<150 characters) or contact transmissions; verified payloads persist to Firestore, triggering celebration confetti and success chimes.
  4. *Friends Universe & Family Vault*: Floating interactive portals showcase friends dossiers and Free Fire squad cards; family sanctuary unlocks with encrypted PIN.
  5. *Admin Command Plane*: Access with authorized credentials opens a comprehensive dashboard with 13 management modules (Skills, Projects, Milestones, Media, Friends, Content, Theme, Audio, Security, and Backup).

- **Visual Identity & Theme**:
  - *Aesthetic Direction*: Cinematic Multiverse Cyberpunk inspired by Doctor Strange (Eldritch amber/gold runic mandalas) and Wanda Maximoff (Scarlet Witch crimson chaos magic) with crisp HUD instrumentation.
  - *Color Palette & Tokens*:
    - 60% Dominant Base: Deep Obsidian Slate (`#020617` / `#030712`)
    - 30% Structural Surfaces: Elevated glassmorphic cards (`#0b0f19` / `rgba(15, 23, 42, 0.75)` with hairline borders)
    - 10% Vibrant Accents: Eldritch Amber (`#f59e0b`), Astral Cyan (`#06b6d4`), Wanda Scarlet (`#e11d48`), and Quantum Emerald (`#10b981`)
  - *Typography*:
    - Display / Headings: `Orbitron` (weights 700, 900) for hero brands and monogram marks
    - Section Subtitles & Badges: `Rajdhani` (weights 600, 700) for tech consoles and cards
    - Code / Metrics: `JetBrains Mono` with `tabular-nums`
    - Body / Hindi: `Noto Sans Devanagari` and system sans
  - *Interactive Feedback & Audio*: Zero-latency procedural Web Audio synthesizer generates sci-fi UI clicks, hover tones, and chimes without external MP3 asset dependencies; includes global mute toggle.

---

### 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full Archive Extraction & Workspace Setup**
  - *Chosen Approach*: Extract all 124 files from `public/assets/aistudio/project-importer_09c403cc.zip` directly into the project root, preserving the complete component modularity, 3D scenes, admin managers, and styles.
  - *Why*: Preserves 100% of the audited code, design system, and multi-layered features without loss or regressions.
- **Decision 2: Live Firebase Firestore Provisioning with Local Fallback**
  - *Chosen Approach*: Provision Firebase via AI Studio tools and wire Firestore collections (`messages`, `guestbook`, `settings`, `images`, `friends`, `family_members`, `admins`). In `src/firebase.ts`, use live Firebase SDK when configured, with seamless offline caching.
  - *Why*: Enables real-time visitor submissions and multi-device persistence while ensuring zero crash risk if offline.
- **Decision 3: Zero-Trust Security Rules & Audit Repair**
  - *Chosen Approach*: Deploy `firestore.rules` enforcing strict validation, max-size string boundaries, server timestamps (`request.time`), and administrator authorization. Address `BUG-004` so default emergency PINs cannot bypass custom credentials.
  - *Why*: Protects private friend notes, family records, and admin mutations from unauthorized tampering.
- **Decision 4: Robust Three.js WebGL Asset Fallback**
  - *Chosen Approach*: Implement `crossOrigin = 'anonymous'` and procedural gradient/canvas fallbacks for all texture loading in `FloatingPhoneHero3D.tsx` and `PhotoOrbitHero3D.tsx`.
  - *Why*: Eliminates WebGL security taint errors if remote external image URLs lack permissive CORS headers.

---

### 4. Technical Architecture & Data Strategy

```
┌────────────────────────────────────────────────────────────────────────┐
│                        INDEX.HTML / APP BOOTSTRAP                      │
│            Google Fonts: Orbitron, Rajdhani, Noto Sans Devanagari       │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                      CONTEXT PROVIDERS & APP ROOT                      │
│   ├── LanguageProvider (mode: 'en' | 'hi', reactive toggle)            │
│   └── ImageProvider (Firestore listeners, site settings, fallbacks)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
         ┌──────────────────────────┴──────────────────────────┐
         ▼                                                     ▼
┌──────────────────────────────┐              ┌──────────────────────────────┐
│     BACKGROUND & 3D GPU      │              │      PAGE SECTIONS & HUD     │
│  - CyberBackground (Canvas)  │              │  - CyberNavbar (Header)      │
│  - CinematicCanvas3D (5-Zone)│              │  - HeroSection (3D Phone)    │
│  - MysticTouchSparks (VFX)   │              │  - UniversalTechConsole (Lens│
│  - BackgroundMusic (Audio)   │              │  - CyberSecuritySection      │
│  - IntroScreen (Assembly)    │              │  - Skills, Roadmap, Projects │
└──────────────────────────────┘              │  - Gallery, Guestbook, Contact│
                                              └──────────────┬───────────────┘
                                                             │
         ┌───────────────────────────────────────────────────┴─────────┐
         ▼                                                             ▼
┌──────────────────────────────┐                              ┌────────────────┐
│      INTERACTIVE MODALS      │                              │    BACKEND     │
│  - FriendsUniverse (Squad 3D)│ ◄──────────Sync────────────► │  Cloud         │
│  - FamilyVaultModal (Passcode│                              │  Firestore     │
│  - AdminModal (13 Managers)  │                              │  & Auth        │
└──────────────────────────────┘                              └────────────────┘
```

- **Interactive State Handlers**:
  - `HeroSection` / `PhotoOrbitHero3D`: Pointer dragging modifies orbit rotation matrix with inertia spring decay.
  - `UniversalTechConsole`: Category tabs filter registry; clicking a technology mounts `Lens3DViewer` with dynamic refraction lighting; 1-click code copying to clipboard.
  - `GuestbookSection`: Form submission validates non-empty inputs, profanity filtering, writes to `guestbook` collection in Firestore, and fires canvas confetti.
  - `AdminModal`: Authenticates credentials against Firebase Auth / Firestore `admins` collection; provides full CRUD operations across all portfolio data.
