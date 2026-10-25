# VISUAL BLUEPRINT: Remix Remix CyberMohit AI Portfolio
**Document Type:** Complete Visual Architecture, Section Geometry & Screen Layout Blueprint  
**Inspection Method:** Static source analysis, component hierarchy tracing, and CSS token measurement.

---

## 1. Overall Viewport & Screen Hierarchy

The application runs as a dark-mode fullscreen web canvas with layered z-index strata:

```
[z-index: 50]  MODALS & OVERLAYS: AdminModal, FriendsUniverse, FamilyVaultModal, IntroScreen
[z-index: 50]  STICKY HEADER: CyberNavbar (h-16, backdrop-blur-xl, border-b)
[z-index: 40]  FLOATING CONTROLS: FireballButton (bottom-6 right-6), CinematicScrollHUD (right-4)
[z-index: 10]  MAIN CONTENT FLOW: 11 Sections + Footer (<main className="relative z-10">)
[z-index: 02]  TOUCH PARTICLES: MysticTouchSparks (canvas fixed inset-0 pointer-events-none)
[z-index: 01]  3D MULTIVERSE: CinematicCanvas3D (Three.js WebGL fixed inset-0 pointer-events-none)
[z-index: 00]  AMBIENT GRID: CyberBackground (canvas fixed inset-0 bg-slate-950)
```

---

## 2. Top-to-Bottom Section-by-Section Blueprint

### SECTION 00: Exploded Intro Screen (Overlay)
- **Component:** `src/components/vfx/IntroScreen.tsx`
- **Unique Element ID:** `INTRO-001` (Container), `INTRO-002` (Skip Button)
- **Visual Classification:** Holographic / Motion 2D + Blur / Kinetic Typography
- **Dimensions & Position:** Fixed full-screen `inset-0`, `z-50`, `bg-slate-950/95` with heavy backdrop blur.
- **Visual Details:**
  - 14 flying text missiles in neon amber (`#f59e0b`), rose (`#f43f5e`), and cyan (`#06b6d4`).
  - Text missiles originate from outer coordinates `(±800px, ±600px)` and converge towards center.
  - Skip Button: Pill-shaped `rounded-full`, `px-4 py-2`, `bg-slate-900/80 border border-amber-500/30 text-amber-400 font-mono text-xs`, positioned `bottom-8 right-8`.
- **States:**
  - Initial: Dispersed off-screen words with rotation `[-180deg to +180deg]`.
  - Final: Converged cluster, flash shockwave, followed by opacity fadeout to 0.

---

### SECTION 01: Top Cybernetic Navigation Bar
- **Component:** `src/components/CyberNavbar.tsx`
- **Dimensions & Position:** Sticky top `top-0`, full width `w-full`, height `h-16` (64px), `z-50`.
- **Background & Border:** `bg-slate-950/80 backdrop-blur-xl border-b border-amber-500/20 shadow-[0_4px_20px_rgba(0,0,0,0.7)]`.
- **Container Max-Width:** `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between`.
- **Elements & IDs:**
  - `NAV-001`: **Monogram Brand Logo:** Outer gradient box `w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 via-rose-500 to-amber-600 p-0.5`. Inner square `bg-slate-950 rounded-[6px]` showing bold text `"MY"`. Accompanying brand wordmark: `"MOHIT YADAV"` (`font-cyber font-bold text-base text-white tracking-wider`).
  - `NAV-002` to `NAV-009`: **Desktop Navigation Links:** `About`, `3D Console`, `Skills`, `Journey`, `Projects`, `3D Gallery`, `Guestbook`, `Contact`. Styled as `text-xs font-mono text-slate-300 hover:text-amber-300 transition px-3 py-1.5`. Hidden on `<1024px` (lg breakpoint).
  - `NAV-010`: **Audio Synthesizer Mute Toggle:** Circular button `p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-amber-400`. Icons: `Volume2` (unmuted) / `VolumeX` (muted).
  - `NAV-011`: **Bilingual Language Toggle:** Button `px-2.5 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-mono text-amber-300 flex items-center gap-1.5`. Displays badge `"EN / HI"`.
  - `NAV-012`: **Low Effects Battery Saver Toggle:** Button `p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-400 hover:text-cyan-300`. Icon: `Zap`.
  - `NAV-013`: **Friends Universe Trigger:** Button `px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-rose-500/20 border border-amber-500/40 text-amber-300 font-cyber font-bold text-xs uppercase hover:border-amber-400`.
  - `NAV-014`: **Family Vault Trigger:** Button `p-2 rounded-xl bg-rose-950/40 border border-rose-500/30 text-rose-300 hover:text-rose-200`. Icon: `Lock` / `Key`.
  - `NAV-015`: **Admin Shield Trigger:** Button `p-2 rounded-xl bg-amber-950/40 border border-amber-500/30 text-amber-400 hover:text-amber-300`. Icon: `Shield`.
  - `NAV-016`: **Mobile Hamburger Toggle:** Button `p-2 rounded-xl bg-slate-900 text-slate-300 lg:hidden`. Toggles slide-down mobile menu drawer.

---

### SECTION 02: Cinematic Scroll HUD (Floating)
- **Component:** `src/components/CinematicScrollHUD.tsx`
- **Unique Element ID:** `HUD-001` (Timeline), `HUD-002` (Back to Top)
- **Visual Classification:** Glassmorphic 2D HUD / Vertical Floating Instrumentation
- **Dimensions & Position:** Fixed right-side `fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden md:flex flex-col items-center gap-3`.
- **Styling:** Vertical progress rail `w-0.5 h-48 bg-slate-800 relative` with an amber traveling thumb `bg-amber-400 shadow-[0_0_8px_#f59e0b]`.
- **Node Badges:** 9 numbered pills (`01` to `09`) that expand on hover displaying scene title (`Identity Nexus`, `Bio Reveal`, `3D Console`, etc.).

---

### SECTION 03: Identity Nexus (Hero Section)
- **Component:** `src/components/sections/HeroSection.tsx`
- **Anchor:** `#` / `#hero`
- **Dimensions & Layout:** `min-h-[90vh] py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-between gap-12`.
- **Elements & IDs:**
  - `HERO-001`: **Main Hero Title:** `"MOHIT YADAV"` (`text-5xl sm:text-7xl font-orbitron font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-amber-200 to-amber-500 drop-shadow-[0_0_25px_rgba(245,158,11,0.3)]`).
  - `HERO-002`: **Subtitle Pill:** `inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono text-xs tracking-wider`.
  - `HERO-003`: **Bilingual Bio Paragraph:** `text-sm sm:text-base font-sans text-slate-300 leading-relaxed max-w-xl`.
  - `HERO-004`: **Primary Action Button ("Explore 3D Console"):** `px-6 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-rose-500 to-amber-600 text-slate-950 font-cyber font-bold text-xs uppercase tracking-wider shadow-[0_0_25px_rgba(245,158,11,0.35)] hover:shadow-[0_0_35px_rgba(245,158,11,0.5)]`.
  - `HERO-005`: **Secondary Action Button ("Friends Universe"):** `px-6 py-3 rounded-2xl bg-slate-900/90 border border-amber-500/40 text-amber-300 font-cyber font-bold text-xs uppercase tracking-wider hover:bg-slate-800`.
  - `HERO-006`: **3D Flagship Mobile Phone Canvas:** WebGL canvas container `w-full max-w-[420px] aspect-[9/16] relative flex items-center justify-center`. Renders 3D smartphone chassis with metallic chamfer, glass screen texture, and dynamic reflection.
  - `HERO-007`: **3D Orbiting Satellite Cards:** Up to 5 satellite photo cards revolving along an elliptical orbit path.

---

### SECTION 04: Academic & Tech Odyssey (About Section)
- **Component:** `src/components/sections/AboutSection.tsx`
- **Anchor:** `#about`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12`.
- **Elements & IDs:**
  - `ABOUT-001`: **Section Header:** Unboxed floating typography `"ACADEMIC & TECH ODYSSEY"` (`font-cyber font-bold text-3xl sm:text-4xl text-white tracking-widest`).
  - `ABOUT-002`: **Board Credential Pill:** `px-4 py-1.5 rounded-full bg-cyan-950/40 border border-cyan-500/30 text-cyan-300 font-mono text-xs`. Displays `"Class 12 Science (PCM) • BSEB Bihar Board"`.
  - `ABOUT-003`: **Biography & Target Role Card:** Glassmorphic card `p-6 sm:p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80`.
  - `ABOUT-004` to `ABOUT-009`: **6 Domain Capability Badges:** Grid `grid-cols-2 sm:grid-cols-3 gap-3.5`.
    - AI Engineering & Agents (`Brain` icon)
    - Python Systems Architecture (`Cpu` icon)
    - Defensive Cyber Operations (`Shield` icon)
    - Full-Stack Web & Android (`Globe` icon)
    - Algorithms & Binary Systems (`Binary` icon)
    - Futuristic Vision & Strategy (`Compass` icon)
    - Each badge wrapped in `MysticTiltCard` with 3D mouse tilt.

---

### SECTION 05: Universal Tech Console (3D Observatory)
- **Component:** `src/components/sections/UniversalTechConsole.tsx`
- **Anchor:** `#tech-console`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8`.
- **Elements & IDs:**
  - `TECH-001`: **Section Header:** `"UNIVERSAL TECH CONSOLE & OBSERVATORY"`.
  - `TECH-002`: **Category Selector Bar:** Horizontal scrollable pill row (`All`, `Languages`, `Frameworks`, `Databases`, `Cloud & Deploy`, `AI/ML`, `Tools`).
  - `TECH-003`: **Search Filter Field:** `w-full sm:w-80 px-4 py-2 rounded-xl bg-slate-900/90 border border-slate-800 text-white font-mono text-xs focus:border-amber-400`.
  - `TECH-004`: **Technology Grid Cards:** 3-column responsive grid (`grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4`). Each card showcases official SVG mark, version badge, proficiency meter, and short summary.
  - `TECH-005`: **3D Optical Lens Dossier Modal:** Clicking any card opens a modal featuring `Lens3DViewer` (a rotating Three.js 3D optical camera lens focusing colored light rays on the technology's SVG mark).
  - `TECH-006`: **Copy Code Snippet Button:** Integrated terminal block with 1-click clipboard copy.

---

### SECTION 06: Ethical Cyber Defense & Shield
- **Component:** `src/components/sections/CyberSecuritySection.tsx`
- **Anchor:** `#cybersecurity`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8`.
- **Elements & IDs:**
  - `CYBER-001`: **Defense Manifesto Card:** Explains Zero-Trust protocols, cryptographic salt hashing, and defensive ethics.
  - `CYBER-002`: **Live Interactive Security Terminal:** Simulated Linux/Android bash terminal interface (`bg-black/90 border border-cyan-500/40 rounded-2xl p-5 font-mono text-xs`).
  - `CYBER-003`: **"Run Security Audit" Trigger:** Button executing an animated 4-phase audit (port scanning, crypto inspection, rule verification, perimeter lock).
  - `CYBER-004`: **Live Terminal Output Lines:** Streaming green/cyan terminal text with timestamped status logs.

---

### SECTION 07: Skills Arsenal (Proficiency Matrix)
- **Component:** `src/components/sections/SkillsSection.tsx`
- **Anchor:** `#skills`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8`.
- **Elements & IDs:**
  - `SKILL-001`: **Section Header & Category Tabs:** "Current Stack", "Tools & Platforms", "Learning Horizon".
  - `SKILL-002`: **Skill Progress Meters:** Multi-card grid showing technology title, level percentage (e.g. 92%), and an animated gradient progress bar with glowing tip.

---

### SECTION 08: 2026 Roadmap & Milestones
- **Component:** `src/components/sections/RoadmapSection.tsx`
- **Anchor:** `#roadmap`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12`.
- **Elements & IDs:**
  - `ROAD-001`: **Section Header:** `"THE JOURNEY & ROADMAP"`.
  - `ROAD-002`: **Vertical Timeline Rail:** Alternating left/right milestone cards connected by a luminescent central guideline.
  - `ROAD-003`: **Milestone Badges:** Status pills (`Completed`, `In Progress`, `Future Vision`) with target dates (2024 to 2026+).

---

### SECTION 09: Innovation Matrix (Projects Section)
- **Component:** `src/components/sections/ProjectsSection.tsx`
- **Anchor:** `#projects`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8`.
- **Elements & IDs:**
  - `PROJ-001`: **Filter Tabs:** `All`, `Active Development`, `In Progress`, `Completed`.
  - `PROJ-002`: **Project Cards:**
    - `PinChat`: Real-time chat application concept with feature tags and accent cyan border.
    - `Life Tracker`: Habit metric system with analytics features.
    - `AI Automation Matrix`: Python scripting and LLM agent tooling.
  - `PROJ-003`: **External Action Links:** GitHub source link and Live Demo link.

---

### SECTION 10: Multiverse 3D Obsidian Gallery
- **Component:** `src/components/sections/GallerySection.tsx`
- **Anchor:** `#gallery`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-8`.
- **Elements & IDs:**
  - `GALLERY-001`: **Gallery Masonry / Grid:** Responsive 4-column card grid (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4`).
  - `GALLERY-002`: **Obsidian Photo Cards:** High-contrast images with dark bevel borders, hover zoom (`group-hover:scale-105`), and bilingual caption overlays.
  - `GALLERY-003`: **Lightbox Fullscreen Overlay:** Full-screen modal with zoom, touch swipe, and left/right keyboard navigation.

---

### SECTION 11: Visitor Guestbook & Uplink
- **Component:** `src/components/sections/GuestbookSection.tsx`
- **Anchor:** `#guestbook`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-8`.
- **Elements & IDs:**
  - `GUEST-001`: **Submission Form:** Name input, message textarea (max 150 characters), and submit button.
  - `GUEST-002`: **Submit Button:** Submits entry to Firestore and triggers celebration confetti.
  - `GUEST-003`: **Approved Message Stream:** Cards displaying visitor greetings with timestamp and verified badges.

---

### SECTION 12: Future Vision & Aspirations
- **Component:** `src/components/sections/VisionSection.tsx`
- **Anchor:** `#vision`
- **Dimensions & Layout:** `py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto text-center space-y-6`.
- **Elements & IDs:**
  - `VISION-001`: **Vision Manifesto Quote Card:** Large glowing quotation marks, mission statement on developing technology for societal empowerment.

---

### SECTION 13: Establish Secure Link (Contact Section)
- **Component:** `src/components/sections/ContactSection.tsx`
- **Anchor:** `#contact`
- **Dimensions & Layout:** `py-24 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8`.
- **Elements & IDs:**
  - `CONTACT-001`: **Channels Matrix:** Direct 1-click copy cards for Email (`mohityadav802316@gmail.com`), WhatsApp (`+918023160000`), Telegram, GitHub, and Instagram.
  - `CONTACT-002`: **Direct Message Form:** Name, Email, Subject, and Message inputs with real-time validation and submission to Firestore.

---

### SECTION 14: Footer
- **Component:** `src/components/sections/Footer.tsx`
- **Dimensions & Layout:** Full width `w-full py-12 px-4 sm:px-6 lg:px-8 bg-slate-950/95 border-t border-slate-900`.
- **Elements & IDs:**
  - `FOOTER-001`: Brand monogram and BSEB student summary.
  - `FOOTER-002`: Footer quick links and copyright notice.
  - `FOOTER-003`: Admin Console link (`"Admin Console"`).
  - `FOOTER-004`: Scroll to Top button (`ArrowUp` icon).

---

### SECTION 15: Floating Action Button (Booyah Fireball)
- **Component:** `src/components/vfx/FireballButton.tsx`
- **Unique Element ID:** `FIREBALL-001`
- **Visual Classification:** Procedural 3D Canvas + Motion Spring Floating Widget
- **Dimensions & Position:** Fixed bottom-right `fixed bottom-6 right-6 z-40`, diameter `78px`.
- **Appearance:** 3D beveled golden/crimson circular frame with dancing canvas flame tongues and rising golden embers, accompanied by a small pill badge `"FRIENDS UNIVERSE"`.

---

## 3. Modals & Overlay Blueprints

### MODAL A: Friends Universe (`FriendsUniverse.tsx`)
- **Element ID:** `MODAL-FRIENDS`
- **Dimensions & Position:** Fixed full-screen overlay `fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/85 backdrop-blur-2xl`. Max-width `max-w-5xl max-h-[92vh] rounded-3xl bg-slate-950 border border-amber-500/30`.
- **Internal Layout:**
  - Header with title `"FRIENDS UNIVERSE"`, count pill, and close button (`X`).
  - Filter bar with category pills (`All`, `Free Fire Squad`, `School Mates`, `College / Prep`, `Brothers & Besties`) and real-time search box.
  - Responsive 3-column friend cards grid with avatar, name, category, good qualities, and actions (`View 3D Dossier` and `Quick Card`).

### MODAL B: Family Vault (`FamilyVaultModal.tsx`)
- **Element ID:** `MODAL-VAULT`
- **Dimensions & Position:** Fixed full-screen overlay `fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-2xl`. Max-width `max-w-4xl max-h-[90vh] rounded-3xl bg-slate-950 border border-rose-500/30`.
- **Internal Layout:**
  - Initial Lock Screen: Keyhole icon, passcode input with eye toggle, unlock button, attempt counter (lockout after 5 failed tries).
  - Unlocked Sanctuary: Respectful grid of family member portraits, bio memories, and multi-photo 3D galleries.

### MODAL C: Master Admin Command Console (`AdminModal.tsx`)
- **Element ID:** `MODAL-ADMIN`
- **Dimensions & Position:** Fixed full-screen overlay `fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-2xl`. Max-width `max-w-6xl max-h-[94vh] rounded-3xl bg-slate-950 border border-amber-500/40`.
- **Internal Layout:**
  - Authentication Gate: Master PIN input (`802316` or custom salted hash).
  - Unlocked Dashboard: Left sidebar with 13 manager tabs; right content area rendering the selected management module.
