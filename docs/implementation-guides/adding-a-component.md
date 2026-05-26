# Adding a Design System Component

Design system components are reusable, themed UI building blocks that maintain visual consistency across Breakdown. All components live in `components/` and use CSS Modules for styling with design tokens.

## Component Location

```
components/
├── ui/
│   ├── AmountText.tsx
│   ├── AmountText.module.css
│   ├── Button.tsx
│   ├── Button.module.css
│   └── Card.tsx
├── form/
│   ├── TextInput.tsx
│   └── TextInput.module.css
└── feedback/
    ├── Toast.tsx
    └── EmptyState.tsx
```

## Component Template Structure

Every design system component follows this pattern:

1. **`'use client'` directive** — all interactive/styled components are client components
2. **Props interface** — define all props with TypeScript
3. **CSS Module import** — styles co-located with component
4. **Component function** — use `className` from styles, not inline style objects
5. **Named export** — for easy tree-shaking and imports

## Styling with CSS Modules

CSS Modules scope styles to the component. No class name collisions across components.

```typescript
// components/ui/Button.module.css
.button {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 6px;             /* tokens.borderRadius.md */
  font-family: 'Inter-Medium', sans-serif;
  cursor: pointer;
  transition: background-color 80ms ease-out;  /* tokens.animation.durations.xs */
}

.primary {
  background-color: #C27B28;      /* tokens.colors.amber */
  color: #FFFFFF;
}

.primary:hover {
  background-color: #8A5518;      /* tokens.colors.amberDark */
}

.danger {
  background-color: #B05248;      /* tokens.colors.brick */
  color: #FFFFFF;
}

.danger:hover {
  background-color: #7A3630;      /* tokens.colors.brickDark */
}

.ghost {
  background-color: transparent;
  color: #1B1916;                 /* tokens.colors.ink */
  border: 1px solid #D8D1C5;     /* tokens.colors.border */
}

.sm { padding: 0.25rem 0.75rem; font-size: 0.875rem; }
.md { padding: 0.5rem 1rem; font-size: 1rem; }
.lg { padding: 0.75rem 1.5rem; font-size: 1.125rem; width: 100%; }

.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}
```

```typescript
// components/ui/Button.tsx
'use client';

import styles from './Button.module.css';

interface ButtonProps {
  children: React.ReactNode;
  variant?: 'Primary' | 'Secondary' | 'Ghost' | 'Danger';
  size?: 'Sm' | 'Md' | 'Lg';
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  type?: 'button' | 'submit' | 'reset';
}

export function Button({
  children,
  variant = 'Primary',
  size = 'Md',
  onClick,
  disabled = false,
  loading = false,
  type = 'button',
}: ButtonProps) {
  const variantClass = styles[variant.toLowerCase() as keyof typeof styles];
  const sizeClass = styles[size.toLowerCase() as keyof typeof styles];

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={[
        styles.button,
        variantClass,
        sizeClass,
        (disabled || loading) ? styles.disabled : '',
      ].join(' ')}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
```

## Variants Pattern

Variants control size, sentiment, and state. Use separate CSS classes per variant, applied via `className` composition:

```typescript
// Compose classes dynamically
const className = [
  styles.base,
  styles[variant],     // e.g. styles.positive, styles.negative
  styles[size],        // e.g. styles.sm, styles.lg
].join(' ');
```

## Prop Guidelines

- Accept semantic props (`sentiment`, `size`) not raw CSS (`color`, `fontSize`)
- Provide defaults for all optional props
- Use `className?: string` to allow callers to extend styles

## Testing Pattern

Test components with `@testing-library/react` (NOT react-native):

```typescript
// __tests__/components/ui/Button.test.tsx
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';

describe('Button_primaryVariant_rendersCorrectly', () => {
  it('should render button with text', () => {
    render(<Button onClick={() => {}}>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });
});

describe('Button_disabled_preventsClick', () => {
  it('should not call onClick when disabled', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick} disabled>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).not.toHaveBeenCalled();
  });
});

describe('Button_loading_showsLoadingText', () => {
  it('should show loading text when loading is true', () => {
    render(<Button onClick={() => {}} loading>Submit</Button>);
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });
});
```

## Complete Example: AmountText Component

This is a production-ready web component for displaying monetary amounts:

```css
/* components/ui/AmountText.module.css */

.amount {
  font-family: 'IBMPlexMono-Medium', monospace;
  font-weight: 500;
  text-align: right;
  /* Monospace ensures digits align vertically in lists */
}

.sm { font-size: 0.875rem; line-height: 1.25rem; }  /* 14px */
.md { font-size: 1.125rem; line-height: 1.5rem; }   /* 18px */
.lg { font-size: 1.5rem;   line-height: 2rem; }     /* 24px */

.positive { color: #3A6B4D; }  /* tokens.colors.pine */
.negative { color: #B05248; }  /* tokens.colors.brick */
.neutral  { color: #1B1916; }  /* tokens.colors.ink */
```

```typescript
// components/ui/AmountText.tsx
'use client';

import styles from './AmountText.module.css';

/**
 * Monetary amount display component.
 *
 * Uses IBMPlexMono so digits align vertically in accounting lists.
 * Sentiment coloring: positive (pine/green), negative (brick/red), neutral (ink/default).
 * Amounts come pre-formatted as strings from the API (already BigDecimal-safe).
 */
interface AmountTextProps {
  /** Amount as string, e.g. "89.50" (already BigDecimal-formatted from API) */
  value: string;

  /** Visual sentiment */
  sentiment?: 'positive' | 'negative' | 'neutral';

  /** Size variant */
  size?: 'sm' | 'md' | 'lg';

  /** Whether to show the $ currency symbol */
  showSymbol?: boolean;

  /** Optional CSS class for layout-level overrides */
  className?: string;
}

export function AmountText({
  value,
  sentiment = 'neutral',
  size = 'md',
  showSymbol = true,
  className,
}: AmountTextProps) {
  // Format to exactly 2 decimal places
  const formatted = parseFloat(value).toFixed(2);
  const display = showSymbol ? `$${formatted}` : formatted;

  return (
    <span
      className={[
        styles.amount,
        styles[size],
        styles[sentiment],
        className,
      ]
        .filter(Boolean)
        .join(' ')}
    >
      {display}
    </span>
  );
}
```

## Usage Examples

```typescript
// Positive (owed to you)
<AmountText value="89.50" sentiment="positive" size="lg" />
// → $89.50 in pine/green

// Negative (you owe)
<AmountText value="25.75" sentiment="negative" size="md" />
// → $25.75 in brick/red

// Neutral (informational)
<AmountText value="150.00" sentiment="neutral" size="sm" />
// → $150.00 in default ink color

// Without symbol (e.g. inside a labeled field)
<AmountText value="50.00" showSymbol={false} />
// → 50.00
```

## Testing AmountText

```typescript
// __tests__/components/ui/AmountText.test.tsx
import { render, screen } from '@testing-library/react';
import { AmountText } from '@/components/ui/AmountText';

describe('AmountText_positiveValue_showsDollarSign', () => {
  it('should render with dollar sign and 2 decimals', () => {
    render(<AmountText value="25" sentiment="positive" />);
    expect(screen.getByText('$25.00')).toBeInTheDocument();
  });
});

describe('AmountText_negativeValue_formatsCorrectly', () => {
  it('should format to 2 decimal places', () => {
    render(<AmountText value="89.5" sentiment="negative" />);
    expect(screen.getByText('$89.50')).toBeInTheDocument();
  });
});

describe('AmountText_noSymbol_omitsDollarSign', () => {
  it('should not show dollar sign when showSymbol is false', () => {
    render(<AmountText value="50.00" showSymbol={false} />);
    expect(screen.getByText('50.00')).toBeInTheDocument();
    expect(screen.queryByText('$50.00')).not.toBeInTheDocument();
  });
});
```

## Pattern: Creating New Components

Follow this checklist when adding a component:

1. ✅ Create `ComponentName.tsx` in `components/ui/` (or `form/`, `feedback/`, `navigation/`)
2. ✅ Add `'use client'` directive at the top
3. ✅ Create co-located `ComponentName.module.css` with scoped styles
4. ✅ Define a `Props` interface with typed, semantic props
5. ✅ Use `className` composition — no inline `style={{}}` for static values
6. ✅ Hard-code token values in CSS (comments show which token); use `tokens.*` only for dynamic JS values
7. ✅ Named export (not default export)
8. ✅ Add JSDoc comment explaining purpose and key decisions
9. ✅ Write unit tests with `@testing-library/react`
10. ✅ Add to `component-inventory.md` with props table and usage example
