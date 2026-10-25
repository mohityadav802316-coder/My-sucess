# PAGE AND COMPONENT MAP: Remix Remix CyberMohit AI Portfolio

## 1. Top-Level Layout Architecture

The application is structured as an interactive Single Page Application (SPA) with full scroll-driven section progression, sticky header, floating progress HUD, and overlay portals.

```
App.tsx
├── LanguageProvider
└── ImageProvider
    └── MainPortfolio (Screen Root)
        ├── Background Layers (CyberBackground, CinematicCanvas3D, MysticTouchSparks, BackgroundMusic)
        ├── IntroScreen (Overlay conditional: !sessionStorage.mohit_intro_seen)
        ├── CyberNavbar (Sticky Header)
        ├── CinematicScrollHUD (Fixed right progress HUD)
        ├── main.relative
        │   ├── HeroSection (#hero)
        │   ├── AboutSection (#about)
        │   ├── UniversalTechConsole (#tech-console)
        │   ├── CyberSecuritySection (#cybersecurity)
        │   ├── SkillsSection (#skills)
        │   ├── RoadmapSection (#roadmap)
        │   ├── ProjectsSection (#projects)
        │   ├── GallerySection (#gallery)
        │   ├── GuestbookSection (#guestbook)
        │   ├── VisionSection (#vision)
        │   └── ContactSection (#contact)
        ├── Footer
        ├── FireballButton (Fixed bottom-right trigger)
        └── Modals & Portals
            ├── FriendsUniverse (Modal)
            ├── FamilyVaultModal (Modal)
            └── AdminModal (Modal)
```

---

## 2. Detailed Component & Section Map

### 1. `HeroSection` (`src/components/sections/HeroSection.tsx`)
- **Route / Anchor:** `#` or `#hero`
- **Purpose:** Primary digital identity nexus, bilingual introduction, 3D flagship mobile phone displaying central portrait, and rotating 3D photo orbit.
- **Children:** `FloatingPhoneHero3D`, `MysticTextReveal`, `BlackMagicSmoke`.
- **Data Sources:** `useImages()` (`mainProfileImage`, `heroOrbitImages`, `siteSettings.hero`), `useLanguage()`.
- **User Interactions:**
  - "Explore 3D Console" CTA smooth-scrolls to `#tech-console`.
  - "Friends Universe" CTA opens `FriendsUniverse` modal.
  - Interactive 3D phone drag/rotate via mouse and touch.
- **Responsive Behavior:** Stacks vertically on mobile with 3D canvas above or below title; displays side-by-side on desktop (lg+).
- **States:** Graceful fallback to `defaultSiteSettings` if Firestore is offline.

---

### 2. `AboutSection` (`src/components/sections/AboutSection.tsx`)
- **Route / Anchor:** `#about`
- **Purpose:** Academic credentials (BSEB Class 12 Science PCM), personal profile, and 6 glowing domain badges (AI Engineering, Python Systems, Cyber Defense, Cloud, etc.).
- **Children:** `MysticTextReveal`, `MysticTiltCard`, `BlackMagicSmoke`.
- **Data Sources:** `useImages()` (`siteSettings.profile`, `mainProfileImage`), `useLanguage()`.
- **User Interactions:** Hovering over domain cards triggers 3D perspective tilt and spotlight sheen.

---

### 3. `UniversalTechConsole` (`src/components/sections/UniversalTechConsole.tsx`)
- **Route / Anchor:** `#tech-console`
- **Purpose:** 3D interactive technology observatory showcasing languages, frameworks, databases, and DevOps tools.
- **Children:** `Lens3DViewer`, `PremiumBrandLogo`, `MysticTextReveal`.
- **Data Sources:** `UNIVERSAL_TECH_REGISTRY`, `UNIVERSAL_TECH_CATEGORIES`.
- **User Interactions:**
  - Category selector buttons filter items in real time.
  - Search input filters tech by name, category, or features.
  - Clicking a technology displays its detailed dossier with code snippets and an interactive 3D optical lens.
  - 1-click code snippet copy to clipboard with sound feedback.
- **Responsive Behavior:** Flexible multi-column grid adapting from 1 column on mobile to 3 columns on desktop.

---

### 4. `CyberSecuritySection` (`src/components/sections/CyberSecuritySection.tsx`)
- **Route / Anchor:** `#cybersecurity`
- **Purpose:** Showcase of ethical cyber defense skills, Zero-Trust philosophy, and an interactive live vulnerability / integrity audit terminal.
- **Children:** `MysticTextReveal`, `MysticTiltCard`.
- **Data Sources:** Static security matrix and interactive terminal simulator state.
- **User Interactions:**
  - "Run Security Audit" button executes an interactive simulated port and cryptographic integrity check with live terminal output.
  - Copy defense creed to clipboard.

---

### 5. `SkillsSection` (`src/components/sections/SkillsSection.tsx`)
- **Route / Anchor:** `#skills`
- **Purpose:** Terminal-inspired skills proficiency meters and categorized technology stacks.
- **Children:** Progress bars with glowing ambient shadows.
- **Data Sources:** `useImages()` (`skills`), `useLanguage()`.
- **User Interactions:** Tab switching between "Current Stack", "Tools & Platforms", and "Learning Horizon".

---

### 6. `RoadmapSection` (`src/components/sections/RoadmapSection.tsx`)
- **Route / Anchor:** `#roadmap`
- **Purpose:** Chronological milestone timeline from 2024 academic foundation through 2026 AI engineering ambitions.
- **Children:** `MysticTextReveal`.
- **Data Sources:** `useImages()` (`milestones`), `useLanguage()`.
- **User Interactions:** Hover effects with audio feedback on timeline nodes.

---

### 7. `ProjectsSection` (`src/components/sections/ProjectsSection.tsx`)
- **Route / Anchor:** `#projects`
- **Purpose:** Showcase of real projects: `PinChat` (real-time chat concept), `Life Tracker` (personal habit metrics), and AI automation scripts.
- **Children:** Project card grid, status badges, feature tag lists.
- **Data Sources:** `useImages()` (`projects`), `useLanguage()`.
- **User Interactions:**
  - Status filter buttons ('All', 'Active Development', 'In Progress').
  - Modal view for project deep-dives.

---

### 8. `GallerySection` (`src/components/sections/GallerySection.tsx`)
- **Route / Anchor:** `#gallery`
- **Purpose:** Unified obsidian 3D gallery combining portfolio photography, coding setups, and squad moments.
- **Children:** Lightbox modal with zoom and next/previous navigation.
- **Data Sources:** `useImages()` (`allImages`, `galleryImages`), Firestore `friends` collection.
- **User Interactions:** Clicking any image opens full-screen lightbox with keyboard arrow navigation and touch swipe.

---

### 9. `GuestbookSection` (`src/components/sections/GuestbookSection.tsx`)
- **Route / Anchor:** `#guestbook`
- **Purpose:** Public guestbook enabling visitors to leave real-time messages and greetings.
- **Children:** Confetti trigger, input validation, live stream of approved messages.
- **Data Sources:** Firestore collection `visitor_messages` and `guestbook`.
- **User Interactions:**
  - Submitting a message triggers validation, Firestore save, audio chime, and particle confetti explosion.

---

### 10. `VisionSection` (`src/components/sections/VisionSection.tsx`)
- **Route / Anchor:** `#vision`
- **Purpose:** Philosophy statement on technology for social empowerment and long-term goals.
- **Children:** `MysticTextReveal`, `MysticTiltCard`.
- **Data Sources:** `useLanguage()`, `siteSettings.sectionTexts`.

---

### 11. `ContactSection` (`src/components/sections/ContactSection.tsx`)
- **Route / Anchor:** `#contact`
- **Purpose:** Comprehensive communication terminal (Direct email form, WhatsApp link, Telegram, GitHub, Instagram).
- **Children:** Direct contact form, 1-click clipboard copy buttons.
- **Data Sources:** `useImages()` (`siteSettings.contact`), Firestore collection `visitor_messages`.
- **User Interactions:**
  - Submitting contact form writes directly to Firestore and launches confetti.
  - Clicking any handle copies it to clipboard and plays audio click.

---

### 12. `FriendsUniverse` Modal (`src/components/friends/FriendsUniverse.tsx`)
- **Route / Anchor:** Modal trigger from Navbar or FireballButton
- **Purpose:** Interactive directory of friends, teammates, and Free Fire battle squad roster.
- **Children:** `FriendProfileModal`, `FriendHeroProfile`, category filter tabs, search bar.
- **Data Sources:** Firestore collections `friends` and `friend_categories` with fallback to `defaultFriendsList`.

---

### 13. `FamilyVaultModal` (`src/components/family/FamilyVaultModal.tsx`)
- **Route / Anchor:** Modal trigger from Navbar ("Family Vault" key icon)
- **Purpose:** Private sanctuary for family members and ancestral memories.
- **Children:** Password input form, lockout timer, `FamilyMemberHeroProfile`.
- **Security:** Requires passcode; validated via SHA-256 Web Crypto hash with rate-limiting (5 attempts max, 5-minute lockout).

---

### 14. `AdminModal` (`src/components/admin/AdminModal.tsx`)
- **Route / Anchor:** Modal trigger from Navbar or Footer ("Admin Console")
- **Purpose:** Comprehensive management dashboard containing 13 dedicated sub-managers.
- **Security:** Protected by master PIN (`802316` or custom salted hash).
- **Sub-Managers:**
  1. `AdminSkillsManager`: Add, edit, reorder, delete skills.
  2. `AdminProjectManager`: Add, edit, delete projects.
  3. `AdminJourneyManager`: Add, edit, delete roadmap milestones.
  4. `AdminImagesManager`: Upload photos, compress, assign to 3D orbit carousel.
  5. `AdminFriendsManager`: Manage squad members, bad qualities, private dossier notes.
  6. `AdminFamilyManager`: Manage family portraits and configure vault passcode.
  7. `AdminContentManager`: Edit bio, academic board, and bilingual titles.
  8. `AdminThemeCustomizer`: Edit neon accents, background styles, glow intensity.
  9. `AdminAudioManager`: Update background music track, volume, and looping.
  10. `AdminContactManager`: Update social links and availability status.
  11. `AdminGuestbookManager`: Moderate and delete visitor messages.
  12. `AdminSecurityManager`: Change admin PIN and review security status.
  13. `AdminBackupManager`: 1-click JSON export and restore.
