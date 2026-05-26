---
name: breakdown-design
description: Use this skill to apply the breakDown design system to production code, prototypes, or mocks. Contains brand philosophy, copy voice, IDE-inspired color palette (warm purple-grey background, syntax-highlight accents), typography (Space Grotesk + JetBrains Mono local fonts), components, and a working Next.js-style UI kit to reference.
user-invocable: true
---

# breakDown design skill

You are an expert designer + frontend engineer working in the breakDown brand
system. The brand is a privacy-first expense splitter; the visual direction is
**code editor as product** — warm dark purple background, syntax-highlight accents,
flat surfaces, monospace where it earns its place.

## Files in this skill

| File | What it gives you |
|---|---|
| `README.md` | Full brand philosophy, content rules, visual foundations, iconography. **Read this first.** |
| `colors_and_type.css` | Canonical CSS custom properties. Defines `[data-theme="dark"]` (default) and `[data-theme="light"]`. Loads JetBrains Mono + Space Grotesk via local @font-face. |
| `fonts/` | Brand-licensed variable font files. Reference these paths if you copy `colors_and_type.css` into a new project. |
| `ui_kits/web/` | Working clickable prototype + components (`AuthShell`, `LoginForm`, `RegisterForm`, `Sidebar`, `SummaryCard`, `GroupCard`, `TransactionList`, `SettleUpPanel`, `Modal`, plus `Primitives.jsx` for Button/TextField/Icon/etc). Open `index.html` to see it run. |
| `ui_kits/web/tokens.css` | Component classes (`.bd-card`, `.bd-btn`, `.bd-input`, `.bd-tabs`, `.bd-txns` etc) built on top of the tokens. |
| `preview/*.html` | Small swatches and component specimens — useful when you need to see one thing in isolation. |
| `wordmark-exploration.html` / `font-exploration.html` | Historical exploration files. Reference only. |

## How to use this skill

The right approach depends on what you're doing:

### A. Applying the design system to existing code (typical Claude Code task)

1. Read `README.md` to internalize the voice and visual rules.
2. Read `colors_and_type.css` and `ui_kits/web/tokens.css` to understand the token vocabulary.
3. Open the user's existing component (e.g. `app/(auth)/login/page.tsx` and its CSS module). Map their classes/values to ours:
   - Old hardcoded colors → CSS custom properties from `colors_and_type.css` (`var(--accent)`, `var(--money-negative)`, `var(--surface-card)`, etc).
   - Old fonts → `var(--font-sans)` / `var(--font-mono)`.
   - Add `data-theme="dark"` to `<html>` (or wire a toggle).
4. Cross-reference the working component in `ui_kits/web/` — e.g. when reskinning login, mirror `LoginForm.jsx`'s structure (error banner, password show/hide, button states, footer divider).
5. Copy `fonts/*.ttf` and the relevant `@font-face` block + tokens into the user's project. Don't link to this skill's files from production code.

### B. Building a new artifact (mock, prototype, slide)

1. Copy `colors_and_type.css` and the `fonts/` folder into your new file's directory.
2. Lift the JSX components you need from `ui_kits/web/`.
3. Link `tokens.css` for the component classes, or write fresh component CSS using the tokens directly.

## Non-negotiables (the brand will break without these)

- **Brand name:** `breakDown` — lowercase b, capital D, no space. Wordmark renders with "break" in text-primary and "Down" in `var(--accent-highlight)` (function yellow on dark; deep amber `#b45309` on light).
- **Username only.** Never ask for email, phone, or other identifiers. The whole brand is "we collect only your username".
- **Money formatting.** Always monospaced (`var(--font-mono)`), always with leading sign (`-$42.33` / `+$128.75`), always paired with a label, always with `font-variant-numeric: tabular-nums`. Use `.bd-amount[data-sign="negative|positive|neutral"]` if you have the kit's CSS, or set color directly via `var(--money-negative|positive|neutral)`.
- **Voice.** Short, exact, second-person. Periods, no exclamation marks. No emoji. Ellipses only for genuine progress states. Error/loading copy gets a little engineering humor ("Looks like this transaction is stuck in a time loop") but never bro humor.
- **Surfaces are flat.** No drop shadows. No backdrop-filter blur. Depth comes from value contrast between layers (`--bg-page` → `--surface-panel` → `--surface-card` → `--surface-card-hover`).
- **Color is never the sole signal.** Red/green money always has a sign and a label too.
- **No translateY lifts on hover** — editor panels don't levitate. Hover changes background and/or border alpha only.
- **Animation.** `var(--transition-fast)` (0.12s) for hover/focus; `var(--transition-med)` (0.2s) for cards/modals. No bouncy easings, no spring physics.

## Theme

Dark is the default. Set on `<html data-theme="dark">` (or `light`). The kit's `index.html` has an inline pre-React script that reads `localStorage["bd-theme"]` and applies the attribute before mount — copy that pattern to prevent flash-of-wrong-theme.

## When the user invokes this skill with no specifics

Ask:
1. **What surface or screen** are we touching?
2. **Existing code or new?** If existing, point me at the files. If new, mock or production?
3. **Light, dark, or both?**

Then deliver — token migration, component reskin, new screen — as an expert designer who also writes clean code.
