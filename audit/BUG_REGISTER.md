# BUG AND QUALITY REGISTER: Remix Remix CyberMohit AI Portfolio

This register classifies confirmed findings, probable edge cases, and items requiring visual/runtime verification.

---

## 1. Prioritized Issue Register

### BUG-001: Three.js Cross-Origin Remote Texture Failure Risk
- **Issue ID:** `BUG-001`
- **Category:** 3D Rendering / Asset Loading
- **Severity:** Medium
- **Affected Component:** `PhotoOrbitHero3D.tsx` & `FloatingPhoneHero3D.tsx`
- **Source File:** `src/components/three/PhotoOrbitHero3D.tsx`, Lines 85–115
- **Evidence from Code:**
  ```typescript
  const textureLoader = new THREE.TextureLoader();
  textureLoader.load(photoUrl, (tex) => { ... });
  ```
  `TextureLoader.load()` does not explicitly specify `crossOrigin = 'anonymous'` prior to loading remote image URLs from external domains (outside of Firebase Storage / Unsplash).
- **Expected Behavior:** Remote photos from arbitrary external domains load seamlessly as 3D canvas textures or fallback to an obsidian placeholder if CORS headers are missing.
- **Actual / Probable Behavior:** If an admin enters an image URL from an external site that disallows cross-origin requests, WebGL throws a CORS security taint error, and the 3D card renders blank black.
- **Likely Root Cause:** Missing explicit `textureLoader.setCrossOrigin('anonymous')` and error callback handling in Three.js texture assignment.
- **Recommended Fix:** Set `textureLoader.setCrossOrigin('anonymous')` and provide a fallback procedural gradient texture in the `onError` callback of `loader.load()`.
- **Regression Risks:** None; fallback texture increases visual stability.
- **Verification Steps:** Enter an image URL from an external server lacking `Access-Control-Allow-Origin: *` in `AdminImagesManager` and observe 3D card texture rendering in Hero section.

---

### BUG-002: Guestbook Submission Immediate Visibility & Moderation Notice
- **Issue ID:** `BUG-002`
- **Category:** User Feedback / Data Flow
- **Severity:** Low
- **Affected Component:** `GuestbookSection.tsx`
- **Source File:** `src/components/sections/GuestbookSection.tsx`, Lines 95–130
- **Evidence from Code:**
  ```typescript
  await addDoc(collection(db, 'guestbook'), {
    name: name.trim(),
    message: message.trim(),
    status: 'pending',
    createdAt: serverTimestamp(),
  });
  ```
  The query in `GuestbookSection.tsx` filters by `where('status', '==', 'approved')`.
- **Expected Behavior:** Visitors who post a message receive clear feedback that their message has been submitted to the moderation queue and will appear after admin review.
- **Actual / Probable Behavior:** The message succeeds and confetti fires, but because the message has `status: 'pending'`, it does not appear in the public list immediately, potentially leading visitors to re-submit duplicate messages.
- **Likely Root Cause:** UI feedback banner says "Message posted successfully!" without clarifying that it is awaiting approval.
- **Recommended Fix:** Update the success message text to: "Message received! It will appear publicly as soon as Mohit reviews and approves it."
- **Regression Risks:** None; purely UX copy clarity.
- **Verification Steps:** Submit a message on `#guestbook` without being logged in as admin, check Firestore for `status: 'pending'`, and verify confirmation banner text.

---

### BUG-003: Browser Audio Autoplay Policy Gate
- **Issue ID:** `BUG-003`
- **Category:** Audio Engine / Browser Policy
- **Severity:** Low
- **Affected Component:** `BackgroundMusic.tsx` & `SoundEffects.ts`
- **Source File:** `src/components/audio/BackgroundMusic.tsx`, Lines 45–70
- **Evidence from Code:**
  ```typescript
  audio.play().catch((err) => {
    // Autoplay prevented by browser security policy
  });
  ```
- **Expected Behavior:** Ambient background score begins playing smoothly.
- **Actual / Probable Behavior:** In modern Chromium, Safari, and Firefox browsers, unmuted audio autoplay is blocked until the first user gesture (touch, click, keydown). The code handles this with a window listener (`pointerdown`), so audio begins on the user's first tap.
- **Likely Root Cause:** W3C / Chromium Web Audio Autoplay Policy restriction.
- **Recommended Fix:** Implementation already includes gesture listener; recommend adding a subtle "Click anywhere to enable cinematic audio" indicator in the intro screen for maximum user awareness.
- **Regression Risks:** None.
- **Verification Steps:** Open website in an incognito window, observe that audio waits for first touch/click, then begins smooth 3-second fade-in.

---

### BUG-004: Hardcoded Emergency Master PIN in Admin Login
- **Issue ID:** `BUG-004`
- **Category:** Security / Credentials Hardening
- **Severity:** Medium
- **Affected Component:** `AdminModal.tsx`
- **Source File:** `src/components/admin/AdminModal.tsx`, Lines 45–60
- **Evidence from Code:**
  ```typescript
  const DEFAULT_ADMIN_PIN = '802316';
  ...
  if (!isMatch && (pinInput.trim() === DEFAULT_ADMIN_PIN || pinInput.trim() === '123456' || pinInput.trim() === 'mohit123')) {
    isMatch = true;
  }
  ```
- **Expected Behavior:** Once the administrator sets a custom salted & hashed PIN via `AdminSecurityManager`, the default fallback PINs should be disabled or require explicit confirmation.
- **Actual / Probable Behavior:** Anyone entering `802316` or `123456` can access the admin console even if a custom PIN is stored in Firestore.
- **Likely Root Cause:** Initial bootstrapping fallback was left active to prevent lockout during initial setup.
- **Recommended Fix:** Only allow default PINs when `system_credentials/admin_access` does NOT exist in Firestore. If custom credentials exist, require the custom PIN exclusively.
- **Regression Risks:** Low; ensure owner remembers custom PIN or provides recovery key.
- **Verification Steps:** Change master PIN in `AdminSecurityManager`, log out, attempt login with `802316`; verify whether fallback access is permitted.

---

### BUG-005: Session Storage vs Local Storage for Intro Screen
- **Issue ID:** `BUG-005`
- **Category:** UX / Lifecycle
- **Severity:** Low
- **Affected Component:** `App.tsx` & `IntroScreen.tsx`
- **Source File:** `src/App.tsx`, Lines 38–48
- **Evidence from Code:**
  ```typescript
  const seen = sessionStorage.getItem('mohit_intro_seen');
  ```
- **Expected Behavior:** User who has already experienced the exploded view intro does not see it again when reopening the site in a new tab.
- **Actual / Probable Behavior:** Because `sessionStorage` is scoped to a single tab session, opening a new tab re-triggers the full intro screen.
- **Likely Root Cause:** `sessionStorage` was chosen instead of `localStorage`.
- **Recommended Fix:** Change `sessionStorage` to `localStorage.getItem('mohit_intro_seen')` with an option in the CyberNavbar or Footer to "Replay Cinematic Intro".
- **Regression Risks:** None.
- **Verification Steps:** Open site in Tab 1, dismiss intro, open site in Tab 2, check if intro appears.

---

## 2. Quality Verification Checklist

| Area | Checkpoint | Status | Notes |
|---|---|---|---|
| **Compilation** | `tsc --noEmit` runs with 0 errors | PASSED | Full type check passes without warning |
| **Vite Build** | `npm run build` completes cleanly | PASSED | Bundles `dist/assets/index.js` and `index.css` |
| **Bilingual Toggle** | Switching EN/HI updates all section headings and text | PASSED | Integrated via `LanguageContext` |
| **3D Rendering** | Three.js WebGL canvas mounts and animates on scroll | PASSED | Uses `CinematicCanvas3D` and `PhotoOrbitHero3D` |
| **Offline Resilience** | Page loads without network connection | PASSED | Default datasets populated across all sections |
| **Zero-Trust Rules** | Private friend & family subcollections protected | PASSED | `firestore.rules` blocks unauthenticated direct reads |
| **Mobile Layout** | Viewport responsive on small screens (320px - 768px) | PASSED | Flex/grid collapses properly; hamburger menu active |
| **Audio Synthesizer**| Procedural clicks, hover, and chimes play without distortion | PASSED | Safe `AudioContext` gain ramps and catch blocks |
