# INTERACTION MAP: Remix Remix CyberMohit AI Portfolio

This report traces all user interactive elements, input events, event handlers, state transitions, and audio cues across the application.

---

## 1. Global Navigation & Header (`CyberNavbar.tsx`)

| Element | Interaction Type | Event Handler / Callback | Target State / Destination | Audio Cue | Status |
|---|---|---|---|---|---|
| **Brand Monogram "MY"** | Click | `onClick={() => sound.playClick()}` | Smooth scroll to top `#` | `sound.playClick()` | Verified |
| **Nav Links (About, Tech, Skills, etc.)** | Hover / Click | `onMouseEnter={() => sound.playHover()}` | Smooth scroll to anchor `#id` | `sound.playHover()` | Verified |
| **Language Switcher (EN / HI)** | Click | `toggleLanguage()` -> `setMode(nextMode)` | Toggles `mode` between `'en'` and `'hi'` in `LanguageContext` | `sound.playClick()` | Verified |
| **Sound Toggle Button** | Click | `toggleSound()` -> `sound.toggleMute()` | Flips mute state in `SoundEffectsManager` and `localStorage` | Audio unmute chime | Verified |
| **Low Effects Toggle** | Click | `toggleLowEffects()` | Dispatches `mohit_toggle_low_effects` event and saves to storage | `sound.playClick()` | Verified |
| **Friends Universe Button** | Click | `onOpenFriends()` | Sets `isFriendsOpen = true` in `App.tsx` | `sound.playClick()` | Verified |
| **Family Vault Key Button** | Click | `onOpenFamilyVault()` | Sets `isFamilyVaultOpen = true` in `App.tsx` | `sound.playClick()` | Verified |
| **Admin Shield Button** | Click | `onOpenAdmin()` | Sets `isAdminOpen = true` in `App.tsx` | `sound.playClick()` | Verified |
| **Mobile Menu Toggle (Hamburger)**| Click | `setMobileMenuOpen(!mobileMenuOpen)` | Opens responsive drawer on viewports < 1024px | `sound.playClick()` | Verified |

---

## 2. Floating Widgets & Controls

| Element | Interaction Type | Event Handler / Callback | Target State / Destination | Audio Cue | Status |
|---|---|---|---|---|---|
| **FireballButton** (`FireballButton.tsx`) | Click / Tap | `onClick()` | Opens `FriendsUniverse` modal | `sound.playClick()` | Verified |
| **Scroll HUD Scene Markers** (`CinematicScrollHUD.tsx`) | Hover / Click | `window.scrollTo({ top: target, behavior: 'smooth' })` | Jumps viewport to corresponding scene | `sound.playHover()`, `playClick()` | Verified |
| **Scroll HUD Back To Top** | Click | `window.scrollTo({ top: 0, behavior: 'smooth' })` | Jumps viewport to top | `sound.playClick()` | Verified |
| **IntroScreen Skip Button** (`IntroScreen.tsx`) | Click | `onComplete()` | Dismisses intro, marks `sessionStorage.mohit_intro_seen` | `sound.playClick()` | Verified |
| **Global Touch / Pointer** | Pointer Move / Touch | Canvas particle emitter in `MysticTouchSparks.tsx` | Spawns fading chaos sparks and eldritch runes | Visual only (silent for performance) | Verified |

---

## 3. Section-Specific Interactions

### HeroSection (`HeroSection.tsx`)
- **"Explore 3D Console" Button:** Click smoothly scrolls to `#tech-console`.
- **"Friends Universe" Button:** Click calls `onOpenFriends()`.
- **3D Floating Flagship Phone:** Mouse drag or touch swipe rotates phone chassis on X and Y axes with damping spring recovery.

### UniversalTechConsole (`UniversalTechConsole.tsx`)
- **Category Filter Tabs:** Click sets `selectedCategory`.
- **Search Input:** Input event filters tech items by name, category, or features.
- **Tech Item Grid Card:** Click selects active tech item, opens detail modal with 3D lens.
- **Copy Code Snippet Button:** Click copies snippet to clipboard via `navigator.clipboard.writeText`, changes icon to checkmark for 2 seconds, and plays `sound.playSuccess()`.
- **Close Dossier Button:** Click dismisses detail view and plays `sound.playClick()`.

### CyberSecuritySection (`CyberSecuritySection.tsx`)
- **"Run Security Audit" Button:** Click initiates 4-phase terminal simulation (Scanning ports, inspecting crypto salt, verifying Firestore rules, establishing zero-trust perimeter) with animated line printing and audio pulses.
- **Copy Security Creed Button:** Copies ethical defense declaration to clipboard.

### SkillsSection (`SkillsSection.tsx`)
- **Tab Filter Buttons:** Click toggles between "Core Stack", "Tools & Cloud", and "Learning Horizon".

### ProjectsSection (`ProjectsSection.tsx`)
- **Filter Tabs ('All', 'Active Development', 'In Progress'):** Click filters list.
- **External Links (GitHub / Live Demo):** Click opens external repository or live build in new tab (`rel="noreferrer noopener"`).
- **Project Detail Expand Button:** Opens interactive modal detailing features, target outcomes, and architecture.

### GallerySection (`GallerySection.tsx`)
- **Gallery Grid Card:** Click opens full-screen image lightbox.
- **Lightbox Navigation (Prev / Next Buttons & Arrow Keys):** Advances or reverses image index with wrap-around.
- **Touch Swipe Gestures:** Left swipe triggers Next, right swipe triggers Prev.
- **Close Button (Esc Key or Click):** Closes lightbox modal.

### GuestbookSection (`GuestbookSection.tsx`)
- **Name & Message Inputs:** Real-time character counter and validation.
- **Submit Message Button:** Submits entry to Firestore collection `visitor_messages`, triggers `sound.playSuccess()`, and fires multi-color particle confetti across viewport.

### ContactSection (`ContactSection.tsx`)
- **Quick Copy Buttons (Email, Telegram, WhatsApp):** Copies contact handle to clipboard with visual toast indicator.
- **Contact Message Form:** Validates fields, sends payload to Firestore, triggers confirmation notice and celebration confetti.

---

## 4. Friends Universe Interactions (`FriendsUniverse.tsx`)

| Element | Interaction Type | Event Handler / Callback | Target State / Destination | Audio Cue | Status |
|---|---|---|---|---|---|
| **Category Pill Filters** | Click | `setSelectedCategory(cat.id)` | Filters displayed friend cards | `sound.playClick()` | Verified |
| **Search Input** | Type | `setSearchQuery(e.target.value)` | Filters friend cards by name or qualities | Silent | Verified |
| **Friend Card Click** | Click | `setHeroFriend(friend)` | Opens full-screen 3D flagship profile view | `sound.playClick()` | Verified |
| **"Quick Card" Button** | Click | `setSelectedFriend(friend)` | Opens quick dossier modal | `sound.playClick()` | Verified |
| **Back Button in Hero Profile**| Click | `setHeroFriend(null)` | Returns to Friends Universe grid | `sound.playClick()` | Verified |
| **"View 3D Gallery" in Profile**| Click | Opens `FriendGalleryModal` | Full-screen multi-photo gallery | `sound.playClick()` | Verified |

---

## 5. Family Vault Interactions (`FamilyVaultModal.tsx`)

| Element | Interaction Type | Event Handler / Callback | Target State / Destination | Audio Cue | Status |
|---|---|---|---|---|---|
| **Passcode Input** | Type / Submit | `handleSubmitPasscode()` | Computes SHA-256 hash with salt, verifies match | `sound.playSuccess()` on unlock, `sound.playAlert()` on failure | Verified |
| **Eye Toggle** | Click | Toggles password visibility | Shows plain text or masked bullets | Silent | Verified |
| **Family Member Card** | Click | `setSelectedMember(member)` | Opens full-screen 3D memory profile | `sound.playClick()` | Verified |
| **Lockout Timer** | Automatic | Disables form for 5 minutes after 5 consecutive failures | Prevents brute-force guessing | `sound.playAlert()` | Verified |

---

## 6. Admin Control Plane Interactions (`AdminModal.tsx`)

| Element | Interaction Type | Event Handler / Callback | Target State / Destination | Audio Cue | Status |
|---|---|---|---|---|---|
| **Admin Master PIN Form** | Submit | `handleLogin()` | Verifies PIN (`802316` or custom salted hash) | `sound.playSuccess()` / `playAlert()` | Verified |
| **Sidebar Manager Tabs (13)** | Click | `setActiveTab(tab.id)` | Switches active manager view | `sound.playClick()` | Verified |
| **Add / Edit Entry Buttons** | Click | Opens respective CRUD modal | Opens modal with prepopulated or blank form | `sound.playClick()` | Verified |
| **Delete Entry Buttons** | Click | Opens confirmation dialog | Confirms deletion before Firestore doc removal | `sound.playTrash()` | Verified |
| **Photo Upload Inputs** | File Select | `compressImage()` -> `uploadBytes()` | Compresses photo, uploads to Firebase Storage, updates Firestore | `sound.playSuccess()` | Verified |
| **1-Click Export Backup** | Click | Generates blob, triggers `.json` download | Exports complete site state | `sound.playSuccess()` | Verified |
| **Restore Backup File** | File Select | Parses JSON, writes to Firestore | Restores complete snapshot | `sound.playSuccess()` | Verified |
| **Logout Button** | Click | `handleLogout()` | Clears `localStorage` token, locks console | `sound.playClick()` | Verified |
