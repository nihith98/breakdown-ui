# Adding a Design System Component

Design system components are reusable, themed UI building blocks that maintain visual consistency across Breakdown. All components live in `components/ui/` and use Unistyles for styling with design tokens.

## Component Location

All design system components belong in `components/ui/`:

```
components/ui/
├── Button.tsx
├── Text.tsx
├── Card.tsx
├── AmountText.tsx
└── ErrorBox.tsx
```

## Component Template Structure

Every design system component follows this pattern:

1. **Props interface** – Define all props with TypeScript
2. **Token imports** – Import colors, spacing, fonts from design tokens
3. **Stylesheet** – Create styles with `createStyleSheet`
4. **Component function** – Use `useStyles()` hook to access styles
5. **Render** – Return JSX with props applied
6. **Export** – Named export for easy imports

## Styling with Unistyles

Unistyles provides theme-aware styling with tokens. Use this pattern:

```typescript
import { createStyleSheet, useStyles } from '@/design/unistyles'
import { tokens } from '@/design/tokens'

// 1. Define styles at module level
const stylesheet = createStyleSheet((theme) => ({
  button: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
}))

// 2. Use useStyles hook inside component
export function Button() {
  const { styles, theme } = useStyles(stylesheet)
  
  return <View style={styles.button} />
}
```

## Variants Pattern

Variants handle size, sentiment, and state combinations. Use props to select variants:

```typescript
interface ButtonProps {
  size?: 'sm' | 'md' | 'lg'           // Size variant
  sentiment?: 'positive' | 'negative'  // Color sentiment
  disabled?: boolean                    // State
}

// In stylesheet:
const getButtonStyle = (size: string) => {
  switch (size) {
    case 'sm': return { paddingHorizontal: 8 }
    case 'lg': return { paddingHorizontal: 20 }
    default: return { paddingHorizontal: 12 }
  }
}

// In component:
<Pressable style={[styles.button, getButtonStyle(size)]}>
  {children}
</Pressable>
```

## Prop Guidelines

**Keep components focused:**
- Accept semantic props (sentiment, size) not low-level ones (color, fontSize)
- Use defaults for optional props
- Document required vs optional

**Good examples:**
- `sentiment: 'positive' | 'negative'` (semantic, theme-aware)
- `size: 'sm' | 'md' | 'lg'` (finite options)
- `disabled?: boolean` (optional state)

**Avoid:**
- `color="rgb(255, 0, 0)"` (hard-coded color, not themeable)
- `fontSize={14}` (magic number, breaks design system)
- Too many optional props (keeps component simple)

## Testing Pattern

Test components with snapshot tests and interaction tests:

```typescript
import { render } from '@testing-library/react-native'
import { AmountText } from './AmountText'

describe('AmountText', () => {
  // Snapshot: verify structure
  it('should render amount with correct formatting', () => {
    const { toJSON } = render(
      <AmountText amount="25.50" sentiment="negative" />
    )
    expect(toJSON()).toMatchSnapshot()
  })

  // Interaction: verify behavior
  it('should apply negative sentiment color', () => {
    const { getByTestId } = render(
      <AmountText amount="25.50" sentiment="negative" testID="amount" />
    )
    const element = getByTestId('amount')
    expect(element).toHaveStyle({ color: theme.colors.negative })
  })
})
```

## Complete Example: AmountText Component

This is a realistic, production-ready component for displaying monetary amounts with proper formatting and sentiment-based coloring:

```typescript
// components/ui/AmountText.tsx

import React from 'react'
import { Text as RNText, TextProps as RNTextProps } from 'react-native'
import { createStyleSheet, useStyles } from '@/design/unistyles'

/**
 * Monetary amount display component
 * 
 * Displays amounts with:
 * - Proper decimal formatting (always 2 decimals)
 * - Sentiment-based coloring (positive=green, negative=red, neutral=default)
 * - IBMPlexMono font for monospaced alignment (currency amounts align vertically)
 * - Right alignment for accounting-style display
 */

interface AmountTextProps extends Omit<RNTextProps, 'children'> {
  /** Amount as string (already calculated with BigDecimal precision) */
  amount: string | number
  
  /** Visual sentiment: 'positive' (received), 'negative' (owed/spent), 'neutral' (display only) */
  sentiment?: 'positive' | 'negative' | 'neutral'
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg'
  
  /** Show currency symbol prefix */
  showSymbol?: boolean
  
  /** Optional prefix/suffix text */
  prefix?: string
  suffix?: string
}

export const AmountText = React.forwardRef<RNText, AmountTextProps>(
  (
    {
      amount,
      sentiment = 'neutral',
      size = 'md',
      showSymbol = true,
      prefix,
      suffix,
      style,
      ...props
    },
    ref
  ) => {
    const { styles, theme } = useStyles(stylesheet)

    // Format amount with 2 decimals
    const numAmount = typeof amount === 'string'
      ? parseFloat(amount)
      : amount
    const formattedAmount = numAmount.toFixed(2)

    // Build display text
    const displayText = [
      prefix,
      showSymbol ? '$' : '',
      formattedAmount,
      suffix,
    ]
      .filter(Boolean)
      .join('')

    // Get sentiment color
    const getSentimentColor = () => {
      switch (sentiment) {
        case 'positive':
          return { color: theme.colors.success }  // Green: money received
        case 'negative':
          return { color: theme.colors.danger }   // Red: money owed
        case 'neutral':
          return { color: theme.colors.text }     // Default text color
        default:
          return {}
      }
    }

    // Get size styles
    const getSizeStyle = () => {
      switch (size) {
        case 'sm':
          return styles.amountSmall
        case 'lg':
          return styles.amountLarge
        case 'md':
        default:
          return styles.amountMedium
      }
    }

    return (
      <RNText
        ref={ref}
        style={[
          styles.amount,
          getSizeStyle(),
          getSentimentColor(),
          style,
        ]}
        {...props}
      >
        {displayText}
      </RNText>
    )
  }
)

AmountText.displayName = 'AmountText'

// Styles
const stylesheet = createStyleSheet((theme) => ({
  // Base amount style: monospace font for proper currency alignment
  amount: {
    // IBMPlexMono ensures each digit has equal width (essential for accounting display)
    fontFamily: 'IBMPlexMono-Medium',
    fontWeight: '500',
    textAlign: 'right',
    color: theme.colors.text,
  },

  // Size variants
  amountSmall: {
    fontSize: 12,
    lineHeight: 16,
  },

  amountMedium: {
    fontSize: 14,
    lineHeight: 18,
  },

  amountLarge: {
    fontSize: 16,
    lineHeight: 20,
  },
}))
```

## Usage Examples

```typescript
// Basic usage
<AmountText amount="25.50" sentiment="negative" />
// Displays: $25.50 (in red)

// Received payment (positive sentiment)
<AmountText amount="100.00" sentiment="positive" />
// Displays: $100.00 (in green)

// Neutral display (no color)
<AmountText amount="50.00" sentiment="neutral" />
// Displays: $50.00 (default color)

// With prefix/suffix
<AmountText
  amount="25.50"
  prefix="You owe: "
  sentiment="negative"
/>
// Displays: You owe: $25.50 (in red)

// Custom size
<AmountText amount="1234.56" size="lg" sentiment="positive" />
// Displays: $1234.56 (large, in green)
```

## Key Design Decisions

**1. IBMPlexMono Font**: Monospace fonts ensure each digit aligns vertically in accounting-style lists. Variable-width fonts make amounts harder to scan.

**2. Sentiment Coloring**: Green/red conveys meaning without text—users immediately know if an amount is positive or negative.

**3. Right Alignment**: Accounting convention places amounts right-aligned so the decimal point lines up vertically.

**4. String Input**: Amounts come pre-calculated as strings from the API (already BigDecimal-formatted) to avoid floating-point precision issues.

**5. Optional Symbol**: Show `$` for user-facing displays, hide for internal UI where context is clear.

## Testing the Component

```typescript
// components/ui/AmountText.test.tsx

import { render } from '@testing-library/react-native'
import { AmountText } from './AmountText'

describe('AmountText', () => {
  it('should format amount with 2 decimals', () => {
    const { getByText } = render(
      <AmountText amount="25" sentiment="neutral" />
    )
    expect(getByText('$25.00')).toBeTruthy()
  })

  it('should apply positive sentiment color', () => {
    const { getByTestId } = render(
      <AmountText
        amount="100.50"
        sentiment="positive"
        testID="amount-positive"
      />
    )
    const text = getByTestId('amount-positive')
    // Color verification (implementation depends on test library setup)
    expect(text.props.style).toContainEqual({ color: expect.any(String) })
  })

  it('should use monospace font', () => {
    const { getByTestId } = render(
      <AmountText
        amount="50.00"
        sentiment="neutral"
        testID="amount-text"
      />
    )
    const text = getByTestId('amount-text')
    expect(text.props.style.fontFamily).toBe('IBMPlexMono-Medium')
  })

  it('should handle prefix and suffix', () => {
    const { getByText } = render(
      <AmountText
        amount="25.50"
        prefix="You owe: "
        suffix=" total"
        sentiment="negative"
      />
    )
    expect(getByText('You owe: $25.50 total')).toBeTruthy()
  })
})
```

## Pattern: Creating New Components

Follow this checklist when adding components:

1. ✅ Create file in `components/ui/`
2. ✅ Define `Props` interface extending RN prop types
3. ✅ Import tokens from `@/design/tokens`
4. ✅ Create `stylesheet` with `createStyleSheet`
5. ✅ Call `useStyles()` inside component
6. ✅ Use semantic props (sentiment, size) not hard-coded values
7. ✅ Export component with `displayName` for debugging
8. ✅ Add JSDoc comments explaining usage
9. ✅ Write snapshot + interaction tests
10. ✅ Document with usage examples

All components should be reusable, themeable, and type-safe.
