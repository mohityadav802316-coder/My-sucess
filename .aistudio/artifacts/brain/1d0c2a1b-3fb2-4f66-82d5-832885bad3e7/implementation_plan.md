# Cinematic 3D Friend Profile Hero Experience

Transform the Friend Profile experience from a static 2D modal into a high-fidelity, full-screen 3D Hero Page that matches the aesthetic, visual fidelity, and interactivity of Mohit's main 3D home screen (featuring interactive 3D Phone, 3D Photo Orbit, custom accent-colored lighting, direct 1-click WhatsApp chat, and admin-managed details).

## User Review & Critical Decisions

> [!IMPORTANT]
> All three design preferences from Phase 1 have been incorporated into this plan:
> 1. **Full 3D Hero Page**: The friend profile will render as an immersive full-screen 3D hero page just like Mohit's home screen, rather than a flat card popup.
> 2. **Focused & Clean Content**: Strictly presents admin-editable fields (Photo, Name, Nickname/Role, Bio, WhatsApp 1-Click Chat, and Social links) with zero clutter.
> 3. **Custom Accent Lighting**: 3D lighting, holographic rings, button glows, and particle sparks automatically tint to each friend's unique accent color (configured in Admin Panel).

## 1. Overview & Core Concept

- **What It Does**: When any friend is clicked in the Friends Universe or opened via a shareable link (`?friend=ID`), the app renders a dedicated full-screen 3D Hero View. On the right, the interactive 3D Floating Phone showcases the friend's photo with interactive 3D Phone and 3D Photo Orbit switchers. On the left, bold cinematic typography displays the friend's name, role, bio, and prominent 1-click WhatsApp and social links.
- **Target Audience**: Visitors and friends viewing individual profiles on mobile or desktop devices.
- **Key Value**: Replaces the generic flat card with an ultra-premium, cinematic 3D personal showcase that elevates every friend to the same prestige level as the main portfolio hero.

## 2. User Experience & Visual Design

### Key User Flows
1. **Entering Friend 3D View**:
   - User taps a friend row or 3D card in Friends Universe (or opens a shared URL `?friend=xyz`).
   - A smooth cinematic fade/scale transition opens the **Friend 3D Hero Page**.
2. **Interactive 3D Exploration**:
   - Visitors can toggle between **3D Phone View** (interactive phone with gyro/pointer tilt displaying the friend's avatar/photo) and **3D Photo Orbit** (photos rotating around a central hologram).
   - Dynamic 3D lighting and ambient particles radiate the friend's custom accent color (e.g. emerald, cyber cyan, electric gold, neon violet).
3. **Contact & Social Actions**:
   - Prominent, glowing 1-click **WhatsApp Direct Chat** button opens `https://wa.me/...` directly.
   - Clean unboxed social links (Instagram, GitHub, LinkedIn, Portfolio).
   - One-tap **Share Friend Link** button to copy/share their direct 3D URL.
   - Top-left "← Back to Friends" button smoothly returns to the Universe dock/list.

### Visual Identity & Theme
- **Dominant Neutral Canvas**: Obsidian dark slate (`#0A0D14` / `#0B0F19`) matching the cyber portfolio.
- **Dynamic Accent**: Injected dynamically from `friend.accent` (defaults to `#00F2FE` or `#FFB53D` for Squad members).
- **Typography**: Display font for friend's name (`font-cyber font-black tracking-tight`), monospace metadata for role and stats, readable body prose for bio narrative.
- **Zero-Pill Discipline**: All tags and roles rendered as clean unboxed typographic labels with bullet separators.

## 3. Key Product Decisions & Trade-Offs

- **Decision 1: Full-Screen 3D Overlay vs In-Modal 3D Canvas**
  - *Chosen Approach*: Full-screen 3D hero overlay (`FriendHeroProfile3D`).
  - *Why*: Allows Three.js WebGL canvas to have natural viewport dimensions and spatial depth, mirroring `HeroSection`, without being cramped inside a modal container.
  - *Alternatives Considered*: A small 3D canvas inside the existing popup card was rejected because it felt cramped, low quality, and caused performance hitches.
- **Decision 2: Reusing Proven 3D Engine (`FloatingPhoneHero3D` & `PhotoOrbitHero3D`)**
  - *Chosen Approach*: Adapt `FloatingPhoneHero3D` and `PhotoOrbitHero3D` with friend image adapters and color tint props.
  - *Why*: Zero new heavy bundle dependencies; battle-tested WebGL shaders, smooth touch/mouse orbit controls, and mobile performance optimizations already built-in.
- **Decision 3: Scope of Friend Details**
  - *Chosen Approach*: Strictly render fields editable via Admin Panel (`name`, `nickname`, `user/role`, `avatar`, `photos`, `bio`, `whatsapp`, `socials`, `accent`, `squad`).
  - *Why*: Prevents fake or empty fields; guarantees 100% data fidelity with Firestore.

## 4. Technical Architecture & Data Strategy

### System & Component Flow
```
┌────────────────────────────────────────────────────────┐
│                   FriendsUniverse.tsx                  │
│       (Current category dock, list, share link)        │
└───────────────────────────┬────────────────────────────┘
                            │ On select friend
                            ▼
┌────────────────────────────────────────────────────────┐
│               FriendHeroProfile3D.tsx                  │
│   Full-screen 3D Hero Page (replaces FullProfileModal) │
├───────────────────────────┬────────────────────────────┤
│ Left Column (DOM UI)      │ Right Column (3D WebGL)    │
│ - Back to Friends button  │ - 3D View Switcher         │
│ - Share Profile Link      │   (Phone vs Orbit)         │
│ - Squad Member Badge      │ - FloatingPhoneHero3D      │
│ - Friend Name & Nickname  │   (Friend photo on screen) │
│ - Bio narrative           │ - PhotoOrbitHero3D         │
│ - 1-Click WhatsApp Button │   (Friend photo orbit)     │
│ - Social & Contact Links  │ - Tinted 3D scene lights   │
└───────────────────────────┴────────────────────────────┘
                            │
                            ▼
┌────────────────────────────────────────────────────────┐
│             Firestore 'friends' Collection             │
│            (Real-time reactive synchronization)        │
└────────────────────────────────────────────────────────┘
```

### Component Structure
1. **`src/friends/components/FriendHeroProfile3D.tsx`**:
   - Replaces `FullProfileModal.tsx` as the primary profile display component.
   - Takes `friend: Friend`, `onClose: () => void`, `onOpenLightbox: (url: string) => void`.
   - Adapts friend photos into `PortfolioImage` structure for `FloatingPhoneHero3D` and `PhotoOrbitHero3D`.
   - Includes 3D Phone vs 3D Orbit view switcher.
   - Embeds 1-click WhatsApp chat and verified social links.
2. **`src/friends/FriendsUniverse.tsx`**:
   - Wire `activeProfileId` to render `FriendHeroProfile3D` instead of `FullProfileModal`.
   - Maintain seamless URL hash/param deep-linking (`/?friend=ID`).
3. **Performance & Mobile Viewport**:
   - Responsive grid (`grid-cols-1 lg:grid-cols-12`).
   - On mobile screens, 3D Phone scales gracefully without clipping, keeping touch targets accessible.
