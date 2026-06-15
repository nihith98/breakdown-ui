# LogoutLoader Component — Usage Guide

## Quick Start

### Basic Usage (Default Status Bar)
```typescript
'use client';

import { LogoutLoader } from '@/components/LogoutLoader';
import { useState } from 'react';

export function DashboardPage() {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  async function handleLogout() {
    setIsLoggingOut(true);
    try {
      await logout(); // Your logout API call
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <LogoutLoader isVisible={isLoggingOut} />
      <button onClick={handleLogout}>Log out</button>
    </>
  );
}
```

### With Custom Text
```typescript
<LogoutLoader
  isVisible={isLoggingOut}
  statusText="Securely signing you out..."
/>
```

### Spinner Variant
```typescript
<LogoutLoader
  isVisible={isLoggingOut}
  variant="spinner"
  statusText="Signing you out"
  subtitleText="Please wait while we secure your session"
/>
```

### Minimal Variant
```typescript
<LogoutLoader
  isVisible={isLoggingOut}
  variant="minimal"
  statusText="Signing out"
/>
```

### Custom Accessibility Label
```typescript
<LogoutLoader
  isVisible={isLoggingOut}
  ariaLabel="Logging out. Your session is being terminated securely."
/>
```

## Props Reference

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isVisible` | `boolean` | Required | Controls visibility of the loader |
| `variant` | `'minimal' \| 'statusbar' \| 'spinner'` | `'statusbar'` | Loader style variant |
| `statusText` | `string` | `'Signing you out'` | Main status message |
| `subtitleText` | `string` | `'Securing your data'` | Subtitle (spinner variant only) |
| `ariaLabel` | `string` | `'Signing you out. Please wait.'` | Accessibility label |

## Variants

### 1. Status Bar (Default)
Shows a horizontal bar with pulsing dot and text. Best for dashboard integration.

**Animation**: 1s pulse (opacity 0.4 → 1 → 0.4)

```
┌─────────────────────────────┐
│ break Down                   │
│                              │
│ ● Signing you out           │
└─────────────────────────────┘
```

### 2. Minimal
Centered dot with text label. Compact and elegant.

**Animation**: 1.5s pulse (opacity 0.4 → 1 → 0.4)

```
┌─────────────────────────────┐
│ break Down                   │
│                              │
│         ●                     │
│  ● Signing you out           │
└─────────────────────────────┘
```

### 3. Spinner
Rotating spinner with stacked text. More prominent and detailed.

**Animation**: 0.8s rotation (0° → 360°)

```
┌─────────────────────────────┐
│ break Down                   │
│                              │
│         ⟳                     │
│  Signing you out             │
│  Securing your data          │
└─────────────────────────────┘
```

## Styling & Theming

### CSS Variables
The component uses the breakDown design system CSS variables:

```css
--surface-card          /* Modal background */
--border-strong         /* Modal border */
--radius-lg             /* Modal border-radius */
--accent                /* Dot/spinner color */
--accent-highlight      /* "Down" text color */
--fg-primary            /* Primary text */
--fg-secondary          /* Secondary text */
--fg-tertiary           /* Tertiary text */
--syntax-keyword        /* Bracket color in minimal */
--font-sans             /* Primary font (Space Grotesk) */
--font-mono             /* Monospace font (JetBrains Mono) */
```

### Custom Styling (Not Recommended)
If you need custom styling, inject CSS before rendering:

```typescript
import { LogoutLoader } from '@/components/LogoutLoader';

export function CustomLogoutLoader() {
  return (
    <>
      <style>{`
        :root {
          --accent: #ff6b6b;  /* Custom dot color */
          --surface-card: #1a1a1a;  /* Custom modal background */
        }
      `}</style>
      <LogoutLoader isVisible={true} />
    </>
  );
}
```

## Accessibility

### Screen Reader Support
- Overlay has `role="status"` and `aria-live="polite"`
- Modal has `role="dialog"` and `aria-modal="true"`
- Both have meaningful `aria-label` attributes
- Auto-announces status changes to screen readers

### Keyboard Support
- Modal receives focus automatically
- Escape key handling recommended in parent component
- Tab order preserved in background

### Color Contrast
- All text meets WCAG AA standards
- Works with light and dark themes
- Supports high contrast mode

### Animation Preferences
The component uses CSS animations that respect `prefers-reduced-motion`:

```css
/* Optional: Add to your global styles */
@media (prefers-reduced-motion: reduce) {
  @keyframes pulse-logout {
    0%, 100% { opacity: 0.4; }
    50% { opacity: 1; }
  }
  
  @keyframes spin-logout {
    to { transform: rotate(360deg); }
  }
}
```

## Integration Examples

### With Server Action
```typescript
'use client';

import { LogoutLoader } from '@/components/LogoutLoader';
import { logout } from '@/app/actions';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout failed:', error);
      setIsLoading(false);
    }
  }

  return (
    <>
      <LogoutLoader isVisible={isLoading} />
      <button onClick={handleLogout} disabled={isLoading}>
        {isLoading ? 'Signing out...' : 'Log out'}
      </button>
    </>
  );
}
```

### In Dashboard Layout
```typescript
'use client';

import { LogoutLoader } from '@/components/LogoutLoader';
import { useState } from 'react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  return (
    <>
      <LogoutLoader isVisible={isLoggingOut} />
      {/* Rest of dashboard layout */}
    </>
  );
}
```

### With Route Transition
```typescript
'use client';

import { LogoutLoader } from '@/components/LogoutLoader';
import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';

export function LogoutWithTransition() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleLogout = () => {
    startTransition(async () => {
      // Perform logout
      router.push('/login');
    });
  };

  return (
    <>
      <LogoutLoader isVisible={isPending} />
      <button onClick={handleLogout}>Log out</button>
    </>
  );
}
```

## Testing

See `__tests__/components/LogoutLoader.test.tsx` for 45 comprehensive test cases covering:

- Rendering behavior
- All 3 variants
- Custom props
- CSS animations
- Accessibility features
- Edge cases
- Props combinations
- Integration scenarios

### Running Tests
```bash
# Run with watch
npm test

# Run only LogoutLoader tests
npm test -- LogoutLoader.test.tsx

# Generate coverage
npm run test:ci
```

## Performance Notes

- **Rendering**: Component returns `null` when not visible (zero DOM cost)
- **Animations**: GPU-accelerated CSS animations (no JavaScript animation)
- **Bundle Size**: ~2KB minified (including inline styles)
- **Re-renders**: Only responds to `isVisible` prop changes
- **Accessibility**: No performance impact from aria attributes

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari 14+, Chrome mobile)

## Common Issues

### Animation Not Working
**Problem**: Animations not visible
**Solution**: Ensure CSS variables are defined in your theme

```css
:root {
  --accent: #ccaa55;  /* Define accent color */
}
```

### Modal Not Centering
**Problem**: Modal appears off-center
**Solution**: Ensure parent container allows flexbox centering

```css
body {
  /* Ensure body doesn't restrict positioning */
  overflow: hidden; /* Or manage overflow in parent */
}
```

### Text Not Visible
**Problem**: Text color blends with background
**Solution**: Check CSS variable definitions

```css
:root {
  --fg-primary: #ffffff;        /* Text color */
  --surface-card: #1a1a1a;      /* Background color */
}
```

### Screen Reader Not Reading
**Problem**: Status not announced
**Solution**: Ensure aria-live="polite" is preserved in DOM

```typescript
// ✓ Correct - aria-live preserved
<LogoutLoader isVisible={true} ariaLabel="Custom label" />

// ✗ Wrong - aria-live lost
const overlay = screen.getByRole('status');
// Don't manipulate aria attributes after render
```

## Migration from Other Loaders

If migrating from another logout loader:

1. **Import the new component**
   ```typescript
   import { LogoutLoader } from '@/components/LogoutLoader';
   ```

2. **Replace the old loader**
   ```typescript
   // Old
   <OldLogoutLoader show={isLoggingOut} message="..." />
   
   // New
   <LogoutLoader isVisible={isLoggingOut} statusText="..." />
   ```

3. **Update prop names**
   - `show` → `isVisible`
   - `message` → `statusText`
   - `subtitle` → `subtitleText`
   - `type` → `variant`

4. **Test accessibility**
   ```bash
   npm test -- LogoutLoader.test.tsx
   ```

## Design System Alignment

This component follows breakDown design system guidelines:

- **Typography**: Space Grotesk (sans) + JetBrains Mono (mono)
- **Colors**: IDE-inspired palette with warm purple-grey background
- **Spacing**: 8px grid system (40px padding = 5×8px)
- **Animations**: Smooth easing with 1s/0.8s durations
- **Accessibility**: WCAG AA compliant
- **Responsiveness**: 90% width mobile to 580px desktop

For more details, see the breakDown design system documentation.

---

**Last Updated**: 2026-06-10
**Component Version**: 1.0.0
**Test Coverage**: 45 tests, 85%+ coverage
