# Design Tokens Reference

This document contains all design tokens used by Breakdown. Import from `@/theme/tokens` in component files and CSS Modules.

## Tokens Object

```typescript
export const tokens = {
  // ============================================
  // COLORS
  // ============================================
  colors: {
    // Base palette
    canvas: '#EFE9DA',        // Background canvas color
    surface: '#FAF8F2',       // Default surface/container
    surfaceRaised: '#FFFFFF', // Elevated surface (cards, modals)
    
    // Text colors
    ink: '#1B1916',           // Primary text color
    inkMuted: '#7A7066',      // Secondary/muted text
    inkFaint: '#B5AFA5',      // Tertiary/very muted text
    
    // Semantic colors - Amber (warm)
    amber: '#C27B28',         // Primary amber
    amberLight: '#F4E8D0',    // Light amber background
    amberDark: '#8A5518',     // Dark amber
    
    // Semantic colors - Pine (cool)
    pine: '#3A6B4D',          // Primary pine/teal
    pineLight: '#DFF0E5',     // Light pine background
    pineDark: '#1F4430',      // Dark pine
    
    // Semantic colors - Brick (warm-dark)
    brick: '#B05248',         // Primary brick/red
    brickLight: '#F5E5E3',    // Light brick background
    brickDark: '#7A3630',     // Dark brick
    
    // Borders
    border: '#D8D1C5',        // Standard border color
    borderStrong: '#B8B0A5',  // Stronger/more visible border
  },

  // ============================================
  // SPACING
  // ============================================
  spacing: {
    xs: 4,                    // Extra small spacing
    sm: 8,                    // Small spacing
    mdSm: 12,                 // Small-medium spacing
    md: 16,                   // Medium spacing (baseline)
    lg: 24,                   // Large spacing
    xl: 32,                   // Extra large spacing
    xxl: 48,                  // Double extra large
    xxxl: 64,                 // Triple extra large
  },

  // ============================================
  // TYPOGRAPHY
  // ============================================
  typography: {
    // Display font (headings)
    display: 'SpaceGrotesk-Regular',
    displayBold: 'SpaceGrotesk-SemiBold',
    
    // Body font (default text)
    body: 'Inter-Regular',
    bodyMedium: 'Inter-Medium',
    
    // Monospace font (amounts, codes)
    mono: 'IBMPlexMono-Regular',
    monoMedium: 'IBMPlexMono-Medium',
  },

  // ============================================
  // BORDER RADIUS
  // ============================================
  borderRadius: {
    sm: 4,                    // Small radius
    md: 6,                    // Medium radius
    lg: 10,                   // Large radius
  },

  // ============================================
  // ANIMATION
  // ============================================
  animation: {
    durations: {
      xs: 80,                 // 80ms - quick feedback
      sm: 130,                // 130ms - standard
      md: 180,                // 180ms - longer transitions
    },
    easing: 'easeOut',        // Standard easing curve
    // Note: No springs or bounces; easeOut only
  },
} as const;
```

## Usage in Components

### Colors — TypeScript (inline styles or CSS Modules)

```typescript
import { tokens } from '@/theme/tokens';

// Inline styles (for dynamic/conditional coloring)
<p style={{ color: tokens.colors.ink }}>Primary text</p>
<p style={{ color: tokens.colors.inkMuted }}>Secondary text</p>

// Dynamic sentiment coloring
const sentimentColor = isPositive ? tokens.colors.pine : tokens.colors.brick;
<span style={{ color: sentimentColor }}>{amount}</span>
```

### Colors — CSS Modules (preferred for static styles)

In CSS Modules, reference the hex values directly from the tokens file:

```css
/* components/TransactionRow.module.css */
.root {
  background-color: #FAF8F2;  /* tokens.colors.surface */
  border: 1px solid #D8D1C5;  /* tokens.colors.border */
}

.amount-positive { color: #3A6B4D; }  /* tokens.colors.pine */
.amount-negative { color: #B05248; }  /* tokens.colors.brick */
```

To keep CSS Modules and tokens in sync, define CSS custom properties in a global stylesheet:

```css
/* app/globals.css */
:root {
  --color-canvas: #EFE9DA;
  --color-surface: #FAF8F2;
  --color-surface-raised: #FFFFFF;
  --color-ink: #1B1916;
  --color-ink-muted: #7A7066;
  --color-ink-faint: #B5AFA5;
  --color-amber: #C27B28;
  --color-amber-light: #F4E8D0;
  --color-pine: #3A6B4D;
  --color-pine-light: #DFF0E5;
  --color-brick: #B05248;
  --color-brick-light: #F5E5E3;
  --color-border: #D8D1C5;
  --spacing-xs: 4px;
  --spacing-sm: 8px;
  --spacing-md: 16px;
  --spacing-lg: 24px;
  --spacing-xl: 32px;
}
```

Then reference in CSS Modules:
```css
.card {
  background-color: var(--color-surface-raised);
  border: 1px solid var(--color-border);
  padding: var(--spacing-md);
}
```

### Spacing

Use spacing values consistently for padding, margins, and gaps:

```typescript
import { tokens } from '@/theme/tokens';

// Inline styles
<div style={{ padding: tokens.spacing.md }}>
  <p>Padded content</p>
</div>

<div style={{ display: 'flex', gap: tokens.spacing.sm }}>
  <button>Action 1</button>
  <button>Action 2</button>
</div>
```

Or in CSS Modules using the custom properties:
```css
.section {
  padding: var(--spacing-md);
  margin-bottom: var(--spacing-lg);
}
```

### Typography

Apply fonts using the typography tokens. Fonts are loaded in `app/layout.tsx` via `next/font`:

```typescript
import { tokens } from '@/theme/tokens';

// Inline styles for dynamic typography
<h1 style={{ fontFamily: tokens.typography.displayBold, fontSize: '28px' }}>
  Breakdown
</h1>

<p style={{ fontFamily: tokens.typography.body, fontSize: '16px' }}>
  Regular paragraph
</p>

// Amount display (monospace for decimal alignment)
<span style={{ fontFamily: tokens.typography.mono, fontSize: '20px' }}>
  $42.50
</span>
```

In CSS Modules:
```css
.heading {
  font-family: 'SpaceGrotesk-SemiBold', sans-serif;
  font-size: 1.75rem;
}

.amount {
  font-family: 'IBMPlexMono-Medium', monospace;
  text-align: right;
}
```

### Border Radius

```typescript
import { tokens } from '@/theme/tokens';

// Inline
<div style={{ borderRadius: tokens.borderRadius.lg }}>Card</div>
<button style={{ borderRadius: tokens.borderRadius.md }}>Button</button>
```

### Animations

Use animation durations with CSS `transition` or `animation` properties:

```css
/* easeOut transitions */
.button {
  transition: background-color 80ms ease-out;   /* xs: quick feedback */
}

.modal {
  transition: opacity 130ms ease-out;           /* sm: standard */
}

.toast {
  animation: slideIn 180ms ease-out forwards;  /* md: longer */
}
```

When you need JS-driven animation:
```typescript
import { tokens } from '@/theme/tokens';

element.style.transition = `opacity ${tokens.animation.durations.sm}ms ease-out`;
```

## Color Semantics

### Primary Colors
- **Amber** (`#C27B28`): Interactive elements, CTAs, highlights
- **Pine** (`#3A6B4D`): Positive states, success feedback
- **Brick** (`#B05248`): Negative states, errors, destructive actions

### Text Hierarchy
1. **Ink** (`#1B1916`): Primary/body text, high contrast
2. **Ink Muted** (`#7A7066`): Secondary labels, metadata
3. **Ink Faint** (`#B5AFA5`): Disabled text, very low emphasis

### Backgrounds
- **Canvas** (`#EFE9DA`): Page/screen background
- **Surface** (`#FAF8F2`): Section/container background
- **Surface Raised** (`#FFFFFF`): Cards, modals, elevated elements

## Spacing Scale

The spacing system uses a 4px base unit:

- `xs` (4px) - Minimal spacing, tight layouts
- `sm` (8px) - Small gaps between elements
- `mdSm` (12px) - Small-medium padding
- `md` (16px) - Default/standard spacing
- `lg` (24px) - Large sections
- `xl` (32px) - Extra large gaps
- `xxl` (48px) - Page-level spacing
- `xxxl` (64px) - Very large sections

All layout padding and margins should use these values, never magic numbers.

## Animation Guidelines

- **Duration xs (80ms):** Quick feedback animations (button press, state change)
- **Duration sm (130ms):** Standard transitions (page navigation, menu open)
- **Duration md (180ms):** Longer animations (toast notifications, modal appear)
- All animations use `easeOut` timing function
- No springs, bounces, or elastic effects
- Prefer CSS `transition` / `animation` over JavaScript-driven animation

These tokens ensure visual consistency across the Breakdown app and provide a framework for building new features.
