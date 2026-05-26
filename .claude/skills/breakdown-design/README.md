# breakDown Design System

> Visual + brand reference for **breakDown** — a privacy-first expense management
> platform for trips, families, and friend groups.

This system is sourced from two design documents and one codebase:

| Source | What's in it |
|---|---|
| `branding-philosophy.md` (attached to project brief) | Vision, values, tone, archetypes, copy rules |
| `frontend-implementation-guide.md` (attached) | Original color/type spec — superseded by the IDE direction below |
| `breakdown-ui/` (local codebase, Next.js 14 App Router) | Real CSS modules, theme variables, working auth flow |

The brand voice is **"professional, trustworthy, with engineering precision"** —
quiet, exact, JSON-shaped where it can be, never bro-y, never celebratory.

> **Design direction note:** the brand spec originally called for a navy-and-indigo
> palette with glassmorphism. Mid-iteration we pivoted to an **IDE-inspired palette** —
> warm dark purple background, syntax-highlight accents, flat surfaces, monospace where
> it earns its place. The pivot was driven by the audience (developers, architects)
> and the goal of feeling like opening a file in your editor. Everything below
> documents the IDE direction; the navy variant has been retired.

---

## Product surface

There is **one product**: a cross-platform expense splitter (PWA / web / Android / iOS).
The codebase attached is the Next.js web/PWA frontend that talks to a Java + MongoDB
backend through middleware API routes. The auth flow (`/login`, `/register`, `/success`)
is the most-polished surface in the repo — the dashboard pages are placeholder-styled.

Differentiators worth keeping front-of-mind when designing:

- **Username only.** No email, no phone, no identifiers.
- **Family groups settle as one.** A family is one node in the settlement graph.
- **Optimal settlement.** Show the algorithm's logic; don't hide it behind "tap to settle."
- **Recurring expenses.** Subscriptions and monthly bills are baked in.

---

## Content Fundamentals

### Voice

| Trait | Behavior |
|---|---|
| **Casing** | Sentence case for headlines and buttons in copy; **UPPERCASE** for primary CTAs and form labels (`LOG IN`, `USERNAME`). Brand name is always `breakDown` — lowercase b, capital D, no space. |
| **Person** | Second person (`you owe`, `your data`, `your control`). |
| **Length** | Short. Two-line empty states. One-line errors. |
| **Punctuation** | Periods on full sentences. No exclamation marks. Em dash (`—`) in marketing copy. Ellipses (`...`) only for genuine in-progress states. |
| **Emoji** | **Not used in product UI.** Treat as off-limits. |
| **Numbers** | Always exact. Monospaced, leading sign (`-$245.50`, `+$128.75`). |

### Tone in action

```
✅  "No expenses yet. Ready to split something?"
✅  "Looks like this transaction is stuck in a time loop. Try again?"
✅  "Settlement optimized."
✅  "We compute the fewest transactions needed."

❌  "Oops! Something went wrong"
❌  "Awesome! You crushed it"
❌  "Enter group members here."
```

### Easter eggs (earned, not forced)

The IDE-direction pivot turns what used to be easter eggs into the *primary* visual
vocabulary. Use these naturally — don't bolt them on:

- Transaction lists use JSON cues: `[`, `{`, `}`, trailing `,`. The bracket characters
  are colored *keyword purple*. The transaction name is *string orange*. Money values
  are *number green* or *string-error red*.
- Loading copy is task-specific: `"Optimizing settlements..."` not `"Loading..."`.
- The status bar carries `v0.1.0 · engine 0.8.1 · ● no telemetry` and the feedback links.

### Hard avoids

- Bro-culture humor; in-jokes; excessive celebration; forced `// comment` style on UI copy.

---

## Visual Foundations

### Color — IDE palette

- **One flat dark base.** Page sits on a warm purple-grey `#1e1e2e` (no gradient).
  Panels (sidebar, status bar) drop a shade darker to `#1a1a28`. Card surfaces lift
  to `#252539`; their hover state lifts again to `#2d2d44`. There is no glass blur.
- **Two brand accents.** **Keyword purple `#c586c0`** is the primary — used on
  primary buttons, brand mark, focus rings, JSON brackets. **Function yellow `#dcdcaa`**
  is the highlight — active tab indicators, active nav item, secondary CTA, the second
  half of the wordmark (`break` + `Down` in yellow).
- **Money signals come from the syntax palette.** **Number green `#a6e3a1`** for
  positive (owed to you). **String-error orange-red `#f48771`** for negative (you owe).
  Both are direct lifts from a code-editor's "test passed" / "string in error" tokens.
  Color is never the sole signal: a leading `+` / `-` and a textual label always
  accompany the hue.
- **Variable blue `#9cdcfe`** is the link color. Light, calm, distinct from accents.
- **Comment green `#6a9955`** carries muted meta — secondary text under transactions,
  the system-info block, the "// no telemetry" affordance.

### Typography

- **Space Grotesk** for everything UI: headings, labels, buttons, body, navigation.
  Loaded from Google Fonts. Has just enough personality (asymmetric `a`, flat-top `5`)
  to feel branded without becoming costumey.
- **JetBrains Mono** for data: money amounts, transaction names inside the JSON list,
  the status bar, the system-info block in Settings.
- Labels are 11px UPPERCASE, 0.6px tracking, weight 600, secondary-gray. Body is 14px.
  Headings step from 17 → 22 → 30. The brand wordmark uses Space Grotesk at weight 700
  with `-0.04em` tracking — the "Down" half colored function-yellow.

### Backgrounds

- **One canonical background:** flat `#1e1e2e`. No gradient, no imagery, no texture.
  Real code editors don't gradient their backgrounds; neither does breakDown.

### Surfaces (replaces glassmorphism)

```css
/* card */
background: #252539;             /* surface-card */
border: 1px solid rgba(203,166,247,0.15);   /* keyword-purple alpha */
border-radius: 8px;
transition: all 0.2s ease;

/* card hover */
background: #2d2d44;
border-color: rgba(203,166,247,0.35);
/* note: no translateY lift — editors don't lift their panels */
```

Surfaces sit flat. Depth comes from **value contrast between layers**
(base → panel → card → hover) and the alpha of the keyword-purple border, not from
blur or shadow.

### Borders & radius

- Radius scale: **3px** (small chrome), **6px** (inputs, buttons, tags), **8px**
  (large card containers). Slightly tighter than a normal app — closer to an IDE.
- Border alpha increases with interactivity:
  - Default: `rgba(203,166,247,0.15)` — barely visible
  - Hover: `rgba(203,166,247,0.35)` — the card is reaching back
  - Strong (panel chrome): `rgba(255,255,255,0.12)` — neutral structure

### Hover, press, focus

| State | Treatment |
|---|---|
| Button hover (primary) | Background steps mauve → lighter mauve (`#c586c0 → #cba6f7`); no Y-lift. |
| Button press | Background drops to `#b46cb0`. |
| Card hover | Surface bumps `#252539 → #2d2d44`, border alpha 0.15 → 0.35. No lift. |
| Link hover | Color steps variable-blue → function-yellow. May add underline. |
| Nav item active | Color → function-yellow. 2px left border in function-yellow. Background tint `rgba(220,220,170,0.08)`. |
| Focus | Border swaps to keyword-purple plus a 1px box-shadow ring. Always visible. |

No translateY lifts. No box-shadows for depth. The editor metaphor implies flat panels.

### Motion

- **`0.12s ease`** — micro interactions (hover, focus, color change). Faster than the
  navy variant — IDE interactions feel snappy, not slow.
- **`0.2s ease`** — card transitions, modal in, page fade.
- No bouncy easings. No spring physics. No scaling.

### Layout

- 1100px max-width main pane, with sidebar (240px) flanking left.
- Card grids: 1 col mobile, 2 col at 640px, 3 col at 768px+.
- Status bar (30px high) is fixed to the bottom, hosts version info and GitHub/LinkedIn
  feedback links. It's muted by default — secondary text color, links light up to
  function-yellow on hover.
- Mobile touch targets ≥44px.

### Money display rules (unchanged)

1. Always monospaced (JetBrains Mono).
2. Always with a leading sign: `-$245.50` (you owe), `+$128.75` (owed to you).
3. Always with a textual label nearby.
4. Color matches sign: orange-red for negative, green for positive, function-yellow for neutral.
5. Tabular numerics enabled.

---

## Iconography

The codebase ships no icon set. The UI kit inlines a small set of **Lucide-style**
SVGs (1.75px stroke, `currentColor`) for navigation and inline use. For production,
load Lucide from CDN:

```html
<script src="https://unpkg.com/lucide@latest"></script>
<i data-lucide="users"></i>
```

**Flagged substitution:** Lucide is *our* call, not the codebase's. Swap if the team
picks something different (Heroicons, Phosphor, custom).

Hard rules:

- **No emoji** in product UI.
- **No multicolor or gradient icons.** Single-stroke, `currentColor`.
- **No giant decorative icons.** 14–18 px next to text labels.
- **No hand-drawn SVG illustrations.** Use the wordmark or a syntax-styled data block instead.

---

## File index

```
.
├── README.md                 ← you are here
├── SKILL.md                  ← entry point for Claude Code / agents
├── colors_and_type.css       ← canonical IDE-palette tokens (dark only for now)
├── font-exploration.html     ← historical: 3 font directions compared
├── assets/                   ← (empty — wordmark is text-only)
├── preview/                  ← Design System tab cards
└── ui_kits/
    └── web/
        ├── README.md
        ├── index.html        ← clickable prototype (login → dashboard)
        ├── tokens.css        ← imports colors_and_type.css + kit-specific
        ├── App.jsx
        ├── Auth.jsx
        ├── Dashboard.jsx
        └── Primitives.jsx
```

No slide template was provided, so no `slides/` directory. The IDE palette currently
ships dark-only; light variant is a known gap (see *next steps* in chat).
