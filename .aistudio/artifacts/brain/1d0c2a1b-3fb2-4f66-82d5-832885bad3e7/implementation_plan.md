# Implementation Plan: Database Flicker Fix & Friends Tab 'Welcome, Mohit' Animation

Fix the initial data loading flicker across portfolio and friends tabs, implement instant cache display with background sync, and replace the Friends tab loader specifically with an elegant "Welcome, Mohit" cyan-blue neon animation.

---

## 1. User Choices & Technical Architecture
- **Friends Tab Loader Style**: Futuristic Cyan & Blue Neon Pulse (soft glow, dark backdrop, zero heavy 3D or blocking delays).
- **Caching & Data Strategy**: Instant cache display with silent background synchronization. Retain and present preloaded or local cached state immediately so users never see intermediate "Database not found" or "Empty collection" glitches while Firebase initializes.
- **Strict Scope**:
  - The "Welcome, Mohit" animation will **only** appear on the Friends tab loading state.
  - Home, Profile, Gallery, Projects, Admin Panel, and other sections will keep their existing, regular loading behavior.

---

## 2. Proposed Phases

### Phase 1: Fix Initial Database & Data Loading Flicker
- **Investigate & Normalize State**:
  - Distinguish explicitly between `isInitialLoading`, `isBackgroundSyncing`, `isError`, and `isEmpty`.
  - In `src/context/ImageContext.tsx`, `src/friends/data/repository.ts`, and sections (`GallerySection`, `ProjectsSection`, `FriendsUniverse`):
    - Do NOT trigger "Database not found", "No data", or empty placeholder components while initial connection / query is still pending.
    - Serve cached data immediately on first render if available in memory or storage.
    - Only display empty state after Firebase query resolves with an confirmed 0 items.
    - Only display error state if a genuine network or permissions error is caught.

### Phase 2: Friends Tab Loader Replacement ("Welcome, Mohit")
- **Target Component**: Friends tab loading state in `src/friends/FriendsUniverse.tsx` (and `App.tsx` Suspense boundary for Friends tab).
- **Design & Animation**:
  - Replace the multi-ring spinning loader with a dedicated, lightweight `<FriendsWelcomeLoader />`.
  - Typography: Sleek futuristic font with cyan (`#00f2fe`) and electric blue (`#0284c7`) subtle glow and breathing pulse.
  - Text: **Welcome, Mohit**
  - Performance: Pure CSS transitions and Tailwind keyframes. Zero new third-party bundle weight.
  - Responsiveness: No artificial timers; as soon as data or components are ready, transition seamlessly to the universe interface. If already in memory, display the view immediately without re-triggering loader.
  - Error Handling: If an actual network failure occurs, render the retry/error card instead of an infinite welcome loop.

### Phase 3: Testing, Linting & Build Verification
- Run `lint_applet` and `compile_applet`.
- Verify tab switches (Home -> Friends -> Projects -> Gallery) to ensure:
  1. No "Database not found" flickers.
  2. "Welcome, Mohit" shows only on Friends tab genuine load.
  3. No breaking changes or regressions across all pages.
