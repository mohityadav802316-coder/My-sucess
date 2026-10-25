# CHANGE IMPACT GUIDE: Remix Remix CyberMohit AI Portfolio

This guide maps component interdependencies, shared states, and blast radii to prevent regressions when planning future modifications.

---

## 1. High-Impact Critical Components

The following five core files are architectural anchors. Any change to their interfaces, exports, or lifecycle triggers cascading effects across the entire codebase:

### 1. `src/types.ts`
- **Blast Radius:** High (Entire Project).
- **Imported By:** Virtually every component in `src/`, including contexts, sections, 3D viewers, and admin managers.
- **Rules Before Modifying:**
  - Never delete existing properties without checking backward compatibility.
  - Optional fields (`?`) must be used for newly added settings.
  - Keep enums and string literal unions synchronized with Firestore security rules.

### 2. `src/context/ImageContext.tsx`
- **Blast Radius:** High (Data Pipeline & State).
- **Imported By:** `App.tsx`, `HeroSection.tsx`, `AboutSection.tsx`, `SkillsSection.tsx`, `RoadmapSection.tsx`, `ProjectsSection.tsx`, `GallerySection.tsx`, `CyberNavbar.tsx`, and all 13 Admin managers.
- **Rules Before Modifying:**
  - Ensure fallback baseline arrays (`defaultProjects`, `defaultSkills`, `defaultMilestones`, `defaultSiteSettings`) remain populated to preserve offline resilience.
  - Do not alter `updateSiteSettings` signature.

### 3. `src/context/LanguageContext.tsx`
- **Blast Radius:** High (Bilingual UI Layer).
- **Imported By:** All UI components rendering text.
- **Rules Before Modifying:**
  - Must always preserve `mode: 'en' | 'hi' | 'both'` and the `renderText(en, hi)` helper.

### 4. `src/components/audio/SoundEffects.ts`
- **Blast Radius:** Medium (Audio Feedback).
- **Imported By:** All buttons, tilt cards, forms, and navigation bars.
- **Rules Before Modifying:**
  - All sound methods (`playClick`, `playHover`, `playSuccess`, `playError`, `playTrash`, `playAlert`) must fail silently if `AudioContext` is suspended or muted. Never allow audio errors to bubble up to React render trees.

### 5. `src/components/three/CinematicCanvas3D.tsx`
- **Blast Radius:** Medium (GPU & Viewport Rendering).
- **Impacted Elements:** Viewport scroll fluidity and mobile frame rates.
- **Rules Before Modifying:**
  - Always clean up Three.js geometries, materials, and WebGL renderers in `useEffect` return functions.
  - Never increase particle counts beyond 1,500 without testing on low-end mobile devices.

---

## 2. Feature-by-Feature Change Checklist

### If you want to modify...

#### A. Hero Section or 3D Phone Orbit
- **Files to Inspect First:**
  1. `src/components/sections/HeroSection.tsx`
  2. `src/components/three/FloatingPhoneHero3D.tsx`
  3. `src/components/three/PhotoOrbitHero3D.tsx`
  4. `src/components/admin/AdminImagesManager.tsx`
  5. `src/types.ts` (`HeroSettings`, `PortfolioImage`)
- **Key Dependencies:** `siteSettings.hero.orbitImageIds`, `mainProfileImage`, `TextureLoader`.
- **Potential Regressions:** Texture loading CORS errors; camera clipping on narrow mobile viewports.

#### B. 3D Universal Tech Console & Registry
- **Files to Inspect First:**
  1. `src/data/universalTechRegistry.ts`
  2. `src/components/sections/UniversalTechConsole.tsx`
  3. `src/components/three/Lens3DViewer.tsx`
  4. `src/components/vfx/PremiumBrandLogo.tsx`
- **Key Dependencies:** `UNIVERSAL_TECH_REGISTRY` data structure; SVG icon mapping.
- **Potential Regressions:** Missing SVG mark renders fallback box; long code snippets overflow modal.

#### C. Friends Universe & Free Fire Squad
- **Files to Inspect First:**
  1. `src/components/friends/FriendsUniverse.tsx`
  2. `src/components/friends/FriendHeroProfile.tsx`
  3. `src/components/friends/FriendProfileModal.tsx`
  4. `src/components/friends/MySquadSection.tsx`
  5. `src/components/admin/AdminFriendsManager.tsx`
  6. `firestore.rules` (`match /friends/{friendId}`)
- **Key Dependencies:** `defaultFriendsList`, `defaultFriendCategories`, private dossier subcollection (`/private/details`).
- **Potential Regressions:** Exposing private phone numbers or notes without admin authentication; circular import between Friends and Admin.

#### D. Family Vault & Sanctuary
- **Files to Inspect First:**
  1. `src/components/family/FamilyVaultModal.tsx`
  2. `src/components/family/FamilyMemberHeroProfile.tsx`
  3. `src/components/admin/AdminFamilyManager.tsx`
  4. `src/utils/crypto.ts`
  5. `firestore.rules` (`match /family_members/{memberId}`)
- **Key Dependencies:** `hashPasswordWithSalt`, `defaultFamilyMembers`, session token storage.
- **Potential Regressions:** Password verification mismatch if salt encoding changes; lockout timer becoming permanent.

#### E. Admin Dashboard & CMS Controls
- **Files to Inspect First:**
  1. `src/components/admin/AdminModal.tsx`
  2. The specific manager file in `src/components/admin/`
  3. `src/utils/imageCompressor.ts`
  4. `firestore.rules` (Security constraints on `site_settings`, `system_credentials`)
- **Key Dependencies:** Master PIN verification, Firestore write permissions, `ImageContext.updateSiteSettings`.
- **Potential Regressions:** Saving invalid schemas causing Firestore write rule rejection.

#### F. Audio System & Background Soundtrack
- **Files to Inspect First:**
  1. `src/components/audio/SoundEffects.ts`
  2. `src/components/audio/BackgroundMusic.tsx`
  3. `src/components/admin/AdminAudioManager.tsx`
  4. `src/components/CyberNavbar.tsx` (Mute toggle button)
- **Key Dependencies:** Browser autoplay policies; `localStorage.getItem('mohit_portfolio_sound')`.
- **Potential Regressions:** Unhandled autoplay promise rejection on page load; audio failing to mute across both synthesizer and background track simultaneously.
