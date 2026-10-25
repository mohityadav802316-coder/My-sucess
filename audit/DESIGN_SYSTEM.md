# DESIGN SYSTEM: Remix Remix CyberMohit AI Portfolio

## 1. Visual Theme & Philosophy: Cinematic Multiverse Cyberpunk

The visual language bridges cosmic sorcery (Doctor Strange's Eldritch amber/gold mandalas and Wanda Maximoff's Scarlet Witch crimson chaos magic) with high-precision cyberpunk HUD instrumentation.

The application adheres strictly to dark mode dominance with deep obsidian and slate foundations, accented by vibrant luminescent neon tokens.

---

## 2. Color Palette & Design Tokens

### Background & Neutral Tones
- **Deep Obsidian (Base Surface):** `#020617` / `#030712` (`bg-slate-950`)
- **Card Elevated Surface:** `#0b0f19` (`bg-slate-900/80` with `backdrop-blur-xl`)
- **Card Sub-surface:** `#080d1a` (`bg-slate-950/60`)
- **Border Default:** `rgba(245, 158, 11, 0.15)` (`border-amber-500/20` or `border-slate-800`)
- **Text Primary:** `#f8fafc` (`text-slate-100` / `text-white`)
- **Text Secondary:** `#94a3b8` (`text-slate-400`)
- **Text Tertiary / Monospace:** `#64748b` (`text-slate-500`)

### Brand & Luminescent Accents
- **Eldritch Amber / Gold (Primary Hero & Identity):**
  - Base: `#f59e0b` (`amber-500`)
  - Highlight: `#fbbf24` (`amber-400`)
  - Aura Glow: `rgba(245, 158, 11, 0.35)`
- **Wanda Crimson / Scarlet (Chaos Magic & Family Sanctuary):**
  - Base: `#e11d48` (`rose-600`) / `#ef4444` (`red-500`)
  - Aura Glow: `rgba(225, 29, 72, 0.35)`
- **Astral Cyan / Neon Electric (Cyber Defense & 3D Optics):**
  - Base: `#06b6d4` (`cyan-500`) / `#00f0ff`
  - Aura Glow: `rgba(6, 182, 212, 0.35)`
- **Quantum Emerald (Security Verified & Terminal Output):**
  - Base: `#10b981` (`emerald-500`)
  - Aura Glow: `rgba(16, 185, 129, 0.3)`
- **Multiverse Purple / Violet (Learning & High Arcana):**
  - Base: `#8b5cf6` (`purple-500`)
  - Aura Glow: `rgba(139, 92, 246, 0.3)`

---

## 3. Typography Scale & Fonts

The application loads three dedicated Google Font families defined in `index.html`:

| Role | Font Family | Fallback | CSS Utility Class | Weights Used | Usage |
|---|---|---|---|---|---|
| **Display & Monogram** | `Orbitron` | `sans-serif` | `font-orbitron` | 700, 900 | Hero titles, monogram mark, numerical HUD readouts |
| **Headings & Badges** | `Rajdhani` | `sans-serif` | `font-cyber` | 600, 700 | Section headers, card titles, nav links, buttons |
| **Technical & Code** | `JetBrains Mono` / System Mono | `monospace` | `font-mono` | 400, 500, 700 | Terminal output, metrics, status badges, dates |
| **Body & Hindi Script**| `Noto Sans Devanagari` | `sans-serif` | `font-sans` | 400, 500 | Explanatory copy, bilingual paragraphs, bio |

### Typographic Hierarchy
- **H1 (Hero Brand Title):** `text-4xl sm:text-6xl lg:text-7xl font-orbitron font-black tracking-wider`
- **H2 (Section Titles):** `text-2xl sm:text-3xl lg:text-4xl font-cyber font-bold tracking-widest uppercase`
- **H3 (Card & Modal Headings):** `text-lg sm:text-xl font-cyber font-bold tracking-wide`
- **Body Large:** `text-sm sm:text-base font-sans text-slate-300 leading-relaxed`
- **Body Small:** `text-xs font-mono text-slate-400 leading-normal`
- **Micro Badges / Tags:** `text-[10px] sm:text-[11px] font-mono tracking-widest uppercase`

---

## 4. Spacing, Borders, Radii & Shadows

### Border Radius Scale
- `rounded-lg` (`8px`): Small badges, button icons, thumbnail previews.
- `rounded-xl` (`12px`): Input fields, modal buttons, filter pills.
- `rounded-2xl` (`16px`): Standard cards, section panels, tech registry items.
- `rounded-3xl` (`24px`): Master modals (Friends Universe, Family Vault, Admin Console).
- `rounded-full`: Circular avatar portraits, status indicator dots, floating fireball button.

### Elevation & Glowing Aura Shadows
- **Card Subtle Glow:** `box-shadow: 0 4px 20px -2px rgba(0, 0, 0, 0.7), 0 0 15px rgba(245, 158, 11, 0.08)`
- **Hero Phone Elevation:** `box-shadow: 0 25px 60px -15px rgba(0, 0, 0, 0.9), 0 0 40px rgba(245, 158, 11, 0.2)`
- **Modal Deep Backdrop:** `box-shadow: 0 0 60px rgba(245, 158, 11, 0.25)` with `backdrop-filter: blur(24px)`
- **Text Glow:** `drop-shadow(0 0 12px rgba(245, 158, 11, 0.4))`

---

## 5. Layout Grids & Breakpoints

Tailwind CSS v4 standard responsive breakpoints are utilized:
- **`sm` (640px):** Single-column stacked layouts expand to dual-column preview grids.
- **`md` (768px):** Navigation drawer vs inline links; admin sidebar transitions from horizontal scroll to vertical drawer.
- **`lg` (1024px):** Desktop navigation bar renders full horizontal link list; Hero section displays side-by-side 3D phone canvas.
- **`xl` (1280px):** Maximum content container width (`max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`).

---

## 6. Iconography System
- **Provider:** `lucide-react` (clean stroke width `1.5` to `2.0`).
- **Brand SVG Marks:** Custom high-fidelity inline SVGs in `PremiumBrandLogo.tsx` for official vendor logos:
  - Python (Dual Blue/Yellow snake emblem)
  - Firebase (Golden flame emblem)
  - PostgreSQL (Elephant silhouette)
  - React (Cyan orbital atomic rings)
  - Node.js (Hexagonal green mark)
  - Tailwind CSS (Cyan dual wave mark)
  - Free Fire (Booyah flaming shield crest in `MySquadSection.tsx`)
