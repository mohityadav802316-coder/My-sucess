# USER JOURNEY FLOWS: Remix Remix CyberMohit AI Portfolio
**Document Type:** End-to-End User Journeys, Navigation Flows & State Diagrams  
**Methodology:** Traced through component callback props, state hooks, and Firestore operations.

---

## Journey 1: Visitor Exploration to Friends 3D Dossier

```
[Main Page / Hero]
       |
       | User clicks FireballButton (FIREBALL-001) or Navbar Friends (NAV-013)
       v
[Friends Universe Modal (MODAL-FRIENDS)]
       |
       | User clicks Category Pill "Free Fire Squad" (FRIENDS-002)
       v
[Filtered Squad Cards Grid]
       |
       | User clicks "View 3D Dossier" on Aman Kumar card
       v
[FriendHeroProfile Screen (Full-Screen Overlay)]
       |
       | Shows 3D Flagship Phone with Aman's Portrait Texture (HERO-006)
       |
       +---> User clicks "View 3D Gallery (Photos)"
       |           |
       |           v
       |     [FriendGalleryModal Lightbox (FRIENDS-009)]
       |           |
       |           +---> Swipe Left/Right / Next Button
       |           +---> Close Gallery -> returns to FriendHeroProfile
       |
       +---> User clicks "Back to Universe" Button
                   |
                   v
             Returns to Friends Universe Grid
```

### Detailed Steps:
- **Step 1:**
  - **Element ID:** `FIREBALL-001` (or `NAV-013`)
  - **Location:** Floating bottom-right of viewport (or top navbar)
  - **Action:** User clicks / taps the floating dancing flame button.
  - **Result:** Plays `sound.playClick()`, updates `isFriendsOpen = true` in `App.tsx`. `FriendsUniverse` mounts over the screen with `backdrop-blur-2xl`.
- **Step 2:**
  - **Element ID:** `FRIENDS-002`
  - **Location:** Friends Universe header filter bar
  - **Action:** User clicks `"Free Fire Squad"`.
  - **Result:** Plays `sound.playClick()`, updates `selectedCategory = 'freefire'`. The cards re-render instantaneously showing only teammates tagged with Free Fire.
- **Step 3:**
  - **Element ID:** `FRIENDS-005`
  - **Location:** Friend card footer
  - **Action:** User clicks `"View 3D Dossier →"`.
  - **Result:** Plays `sound.playClick()`, updates `heroFriend = friend`. Component unmounts the modal grid and renders `FriendHeroProfile` with a 3D smartphone displaying the friend's portrait.
- **Step 4:**
  - **Element ID:** `FRIENDS-009`
  - **Location:** Inside `FriendHeroProfile`
  - **Action:** User clicks `"View 3D Gallery (Photos)"`.
  - **Result:** Opens `FriendGalleryModal` lightbox where the user can swipe through multiple photos.
- **Step 5 (Back Navigation):**
  - **Action:** User clicks `ArrowLeft` back button.
  - **Result:** Sets `heroFriend = null`, returning the user smoothly to the category-filtered Friends Universe grid.

---

## Journey 2: Visitor Submitting Live Message to Guestbook

```
[Page Scroll to #guestbook (GUEST-001)]
       |
       | User types Name and Message (<150 chars)
       v
[User clicks "Send Message" Button (GUEST-002)]
       |
       +---> [Validation Checks: Empty field or blocked words?]
       |           |
       |           +-- Yes: Shows error banner, plays alert sound
       |           +-- No: Proceeds to Firestore
       v
[Writes payload to Firestore collection: visitor_messages]
       |
       +---> Plays sound.playSuccess()
       +---> Fires multi-color canvas confetti across viewport
       +---> Resets form inputs to blank
       +---> Displays confirmation toast
```

### Detailed Steps:
- **Step 1:**
  - **Element ID:** `GUEST-001`
  - **Location:** Section `#guestbook`
  - **Action:** User types `"Arjun Patel"` in the Name field and `"Great portfolio brother! Booyah!"` in the Message field.
  - **Result:** React state variables `name` and `message` update; character counter updates from `0/150` to `35/150`.
- **Step 2:**
  - **Element ID:** `GUEST-002`
  - **Location:** Bottom of guestbook card
  - **Action:** User clicks `"Send Message"`.
  - **Result:** Form submits to `handleSubmit()`. Input is checked against `BLOCKED_WORDS`. Document is written to `visitor_messages` with `read: false` and `createdAt: serverTimestamp()`. Confetti shoots across the screen and `sound.playSuccess()` plays.

---

## Journey 3: Unlocking the Family Vault (Sanctuary)

```
[Top Navbar Lock/Key Button (NAV-014)]
       |
       | User clicks Family Vault Key icon
       v
[FamilyVaultModal Locked Screen (VAULT-001)]
       |
       | User inputs Passcode (VAULT-002)
       |
       +---> [Passcode Check: SHA-256(password + salt) == storedHash?]
                   |
                   +-- Invalid: Increments failure counter, plays sound.playAlert()
                   |            (If failures == 5, triggers 5-minute lockout)
                   |
                   +-- Valid: Updates isAuthenticated = true, plays sound.playSuccess()
                   v
[Family Members Gallery Unlocked (VAULT-005)]
       |
       | Shows Father, Mother, and family portraits with respect badges
       |
       +---> User clicks family member card -> Opens FamilyMemberHeroProfile
       +---> User clicks Close ("X") -> Clears view, preserves session token
```

### Detailed Steps:
- **Step 1:**
  - **Element ID:** `NAV-014`
  - **Location:** Top right navigation
  - **Action:** User clicks key/lock button.
  - **Result:** Updates `isFamilyVaultOpen = true` in `App.tsx`.
- **Step 2:**
  - **Element ID:** `VAULT-002` & `VAULT-004`
  - **Location:** Center of Family Vault Modal
  - **Action:** User enters PIN and clicks `"Unlock Sanctuary"`.
  - **Result:** The Web Crypto API computes `SHA-256(pin + salt)`. If matched, the lock screen animates out and the respectful family portrait directory animates in.

---

## Journey 4: Administrator Logging In & Uploading New 3D Orbit Photo

```
[Top Navbar Shield Button (NAV-015)]
       |
       | User clicks Admin Shield icon
       v
[AdminModal Security Gate (ADMIN-001)]
       |
       | User inputs Master PIN "802316" (ADMIN-002)
       v
[Admin Command Console Unlocked (ADMIN-004)]
       |
       | User clicks Sidebar Tab "Media & 3D Orbit" (tab: 'images')
       v
[AdminImagesManager Panel (ADMIN-005)]
       |
       | User clicks "Upload Media" (ADMIN-008)
       | Selects high-resolution mobile camera photo (e.g. 8MB .jpg)
       v
[Client-Side Compression: Canvas scales to <= 1600x1600, ~220KB]
       v
[Uploads compressed blob to Firebase Storage: /portfolio/...]
       v
[Writes metadata document to Firestore collection: images]
       v
[User clicks "+ Add Orbit" Button on the newly uploaded image]
       v
[Updates siteSettings.hero.orbitImageIds in Firestore]
       v
[Real-Time Sync: Hero Section immediately adds photo to the 3D orbit carousel]
```

---

## Journey 5: Bilingual Switch (English to Hindi)

```
[Top Navbar Language Pill (NAV-011)]
       |
       | User clicks "EN / HI"
       v
[LanguageContext.tsx flips mode: 'en' -> 'hi']
       v
[All mounted components reactively re-render:]
  - Hero Subtitle: "Future AI Engineer" -> "भावी AI इंजीनियर"
  - About Title: "ACADEMIC & TECH ODYSSEY" -> "शैक्षणिक व तकनीकी सफर"
  - Tech Console Categories: "Languages" -> "भाषाएं"
  - Contact Form Labels: "Your Name" -> "आपका नाम"
  - Footer Student Info: "Class 12 Science" -> "कक्षा 12 विज्ञान छात्र"
```

---

## 6. Edge Case & Failure Flows

| Scenario | Trigger / User Action | Actual System Response | Recovery Path |
|---|---|---|---|
| **Family Vault 5 Failed PIN Tries** | User inputs incorrect PIN 5 times | Form inputs disable, red countdown timer appears: `"Vault locked for 5 minutes"` | User must wait until lockout timer expires |
| **Offline / No Network on Load** | User visits site with network disconnected | App renders all baseline default data (`defaultProjects`, `defaultSkills`, `defaultFriendsList`, `defaultFamilyMembers`) | 100% of the UI remains readable and navigable |
| **Guestbook Profanity Attempt** | User types message containing blocked words | Red warning banner: `"Message contains blocked words. Please keep it respectful."` | Form does not write to Firestore; user edits text |
| **Attempted Image Upload > 15MB** | User selects 4K raw camera photo | `imageCompressor.ts` scales down image on offscreen canvas before transmission | File size drops from 15MB to ~240KB; upload succeeds |
