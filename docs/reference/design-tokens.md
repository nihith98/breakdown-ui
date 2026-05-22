# Design Tokens Reference

This document contains all design tokens used by Breakdown, formatted as a Unistyles-compatible tokens object. Copy-paste directly into your theme configuration.

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

### Colors

Use colors for backgrounds, text, borders, and semantic states:

```typescript
import { tokens } from '@/theme/tokens';

// Text
<Text style={{ color: tokens.colors.ink }}>Primary text</Text>
<Text style={{ color: tokens.colors.inkMuted }}>Secondary text</Text>

// Backgrounds
<View style={{ backgroundColor: tokens.colors.surface }}>
  <Card style={{ backgroundColor: tokens.colors.surfaceRaised }} />
</View>

// Sentiment indicators
<View style={{ backgroundColor: tokens.colors.amberLight }}>
  Positive amount
</View>
<View style={{ backgroundColor: tokens.colors.brickLight }}>
  Negative amount
</View>
```

### Spacing

Use spacing values consistently for padding, margins, and gaps:

```typescript
// Padding
<View style={{ padding: tokens.spacing.md }}>
  <Text>Padded content</Text>
</View>

// Gap in flex layout
<View style={{ gap: tokens.spacing.sm }}>
  <Button />
  <Button />
</View>

// Margins
<View style={{ marginBottom: tokens.spacing.lg }}>
  Section
</View>
```

### Typography

Apply fonts using the typography tokens:

```typescript
// Display heading
<Text style={{ fontFamily: tokens.typography.displayBold, fontSize: 28 }}>
  Breakdown
</Text>

// Body text
<Text style={{ fontFamily: tokens.typography.body, fontSize: 16 }}>
  Regular paragraph
</Text>

// Amount display (monospace for alignment)
<Text style={{ fontFamily: tokens.typography.monoMedium, fontSize: 20 }}>
  $42.50
</Text>
```

### Border Radius

Apply consistent corner radius:

```typescript
// Cards and containers
<View style={{ borderRadius: tokens.borderRadius.lg }}>
  <Card />
</View>

// Buttons
<Pressable style={{ borderRadius: tokens.borderRadius.md }}>
  <Text>Press me</Text>
</Pressable>
```

### Animations

Use animation durations with easeOut timing:

```typescript
import { Animated } from 'react-native';

// Fade transition
Animated.timing(fadeAnim, {
  toValue: 1,
  duration: tokens.animation.durations.sm, // 130ms
  useNativeDriver: true,
}).start();

// Slide transition
Animated.timing(slideAnim, {
  toValue: 0,
  duration: tokens.animation.durations.md, // 180ms
  useNativeDriver: true,
}).start();
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
- Use native driver when possible for performance

These tokens ensure visual consistency across the Breakdown app and provide a framework for building new features.
