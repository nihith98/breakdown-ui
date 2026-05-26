# Component Inventory

This document catalogs all UI components available in the Breakdown frontend, organized by category. Each component includes its location, props interface, variants, and usage examples.

## Primitives (5 components)

### AmountText

Specialized component for displaying monetary values with sentiment-based coloring.

**Location:** `@/components/ui/AmountText`

**Props Interface:**
```typescript
interface AmountTextProps {
  /** Amount to display (e.g., "89.50", "-25.75") */
  value: string;
  
  /** Sentiment color: positive (green/pine), negative (red/brick), neutral (ink) */
  sentiment?: 'positive' | 'negative' | 'neutral';
  
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  
  /** Optional CSS class */
  className?: string;
}
```

**Variants:**
- Size: `sm` (14px), `md` (18px), `lg` (24px)
- Sentiment: `positive` (pine), `negative` (brick), `neutral` (ink)

**Usage:**
```typescript
import { AmountText } from '@/components/ui/AmountText';

<AmountText
  value="89.50"
  sentiment="positive"
  size="lg"
/>

// Owes money
<AmountText
  value="-25.75"
  sentiment="negative"
  size="md"
/>
```

**When to use:** Displaying monetary amounts in transaction rows, settlement cards, or balance summaries. Always use this component for amounts to ensure consistent formatting and color coding.

### BodyText

Typography wrapper for body/paragraph text with consistent styling.

**Location:** `@/components/ui/BodyText`

**Props Interface:**
```typescript
interface BodyTextProps {
  children: ReactNode;
  
  /** Font weight variant */
  weight?: 'regular' | 'medium';
  
  /** Text color */
  color?: string;
  
  /** Optional CSS class */
  className?: string;
}
```

**Usage:**
```typescript
import { BodyText } from '@/components/ui/BodyText';

<BodyText weight="regular">
  This is a paragraph
</BodyText>

<BodyText weight="medium" color={tokens.colors.ink}>
  Important note
</BodyText>
```

### LabelText

Typography wrapper for labels and field descriptions.

**Location:** `@/components/ui/LabelText`

**Props Interface:**
```typescript
interface LabelTextProps {
  children: ReactNode;
  
  /** Text color (defaults to inkMuted) */
  color?: string;
  
  /** Optional CSS class */
  className?: string;
}
```

**Usage:**
```typescript
import { LabelText } from '@/components/ui/LabelText';

<LabelText>Total amount</LabelText>
```

### HeadingText

Typography wrapper for section headings.

**Location:** `@/components/ui/HeadingText`

**Props Interface:**
```typescript
interface HeadingTextProps {
  children: ReactNode;
  
  /** Heading level (h1-h3) */
  level?: 1 | 2 | 3;
  
  /** Optional CSS class */
  className?: string;
}
```

**Usage:**
```typescript
import { HeadingText } from '@/components/ui/HeadingText';

<HeadingText level={2}>Transactions</HeadingText>
```

## Form Components (3)

### TextInput

Text input field with focus and error states.

**Location:** `@/components/form/TextInput`

**Props Interface:**
```typescript
interface TextInputProps {
  /** Placeholder text */
  placeholder?: string;
  
  /** Current value */
  value: string;
  
  /** Change handler */
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  
  /** Error state */
  error?: boolean;
  
  /** Error message to display */
  errorMessage?: string;
  
  /** Input type: text, email, password, amount (monospace) */
  type?: 'text' | 'email' | 'password' | 'amount';
  
  /** Optional label above input */
  label?: string;
}
```

**Focus State:**
- Default border color: `border` (#D8D1C5)
- Focus border color: `ink` (#1B1916)
- Focus shadow: subtle elevation

**Error State:**
- Border color: `brick` (#B05248)
- Error message displayed below input in brick color

**Amount Variant:**
- Font family: monospace (IBM Plex Mono)
- Right-aligned for easier monetary value entry
- Switches to monospace when `type="amount"`

**Usage:**
```typescript
import { TextInput } from '@/components/form/TextInput';

<TextInput
  label="Username"
  type="text"
  placeholder="alice"
  value={username}
  onChange={(e) => setUsername(e.target.value)}
/>

<TextInput
  label="Amount"
  type="amount"
  placeholder="0.00"
  value={amount}
  onChange={(e) => setAmount(e.target.value)}
  error={!isValidAmount}
  errorMessage="Amount must be greater than 0"
/>
```

### Button

Clickable button with multiple variants and sizes.

**Location:** `@/components/form/Button`

**Props Interface:**
```typescript
interface ButtonProps {
  children: ReactNode;
  
  /** Button variant */
  variant?: 'Primary' | 'Secondary' | 'Accent' | 'Ghost' | 'Danger';
  
  /** Button size */
  size?: 'Sm' | 'Md' | 'Lg';
  
  /** Click handler */
  onClick: () => void;
  
  /** Disabled state */
  disabled?: boolean;
  
  /** Loading state (shows spinner) */
  loading?: boolean;
}
```

**Variants:**
- **Primary** (amber, solid): Main CTA buttons
- **Secondary** (surface with border): Alternative actions
- **Accent** (pine, solid): Positive/completion actions
- **Ghost** (transparent): Low-emphasis actions
- **Danger** (brick, solid): Destructive actions

**Sizes:**
- `Sm` (32px height): Compact inline buttons
- `Md` (44px height): Standard buttons
- `Lg` (56px height): Full-width CTAs

**Usage:**
```typescript
import { Button } from '@/components/form/Button';

<Button variant="Primary" size="Lg" onClick={handleSubmit}>
  Create Group
</Button>

<Button variant="Danger" size="Md" onClick={handleDelete}>
  Delete
</Button>

<Button variant="Ghost" size="Sm" onClick={handleCancel}>
  Cancel
</Button>
```

### Badge

Small badge/chip component for status indicators.

**Location:** `@/components/ui/Badge`

**Props Interface:**
```typescript
interface BadgeProps {
  children: ReactNode;
  
  /** Badge variant/color */
  variant?: 'Success' | 'Warning' | 'Danger' | 'Neutral';
  
  /** Dot variant (shows colored dot before text) */
  dot?: boolean;
}
```

**Variants:**
- **Success** (pine background, pine text): Completed, settled
- **Warning** (amber background, amber text): Pending, review needed
- **Danger** (brick background, brick text): Error, failed
- **Neutral** (border, ink text): Default status

**Dot Variant:**
When `dot={true}`, shows a colored circle dot before the text (useful for settlement status indicators).

**Usage:**
```typescript
import { Badge } from '@/components/ui/Badge';

<Badge variant="Success">Completed</Badge>
<Badge variant="Warning" dot>Pending</Badge>
<Badge variant="Danger">Failed</Badge>
```

## Data Display Components (5)

### TransactionRow

Displays a single transaction in a list with payer info, description, and amount.

**Location:** `@/components/ui/TransactionRow`

**Props Interface:**
```typescript
interface TransactionRowProps {
  transaction: Transaction;
  
  /** Optional click handler */
  onClick?: () => void;
  
  /** Show avatar for payer */
  showAvatar?: boolean;
}
```

**Layout:**
- Avatar (optional) | Payer name + Description | Amount (sentiment-colored)
- Amount colored by sentiment (positive=pine, negative=brick)
- Hover state: background lightens

**Usage:**
```typescript
import { TransactionRow } from '@/components/ui/TransactionRow';

<TransactionRow
  transaction={transaction}
  showAvatar={true}
  onClick={() => router.push(`/groups/${transaction.groupId}/transactions/${transaction.id}`)}
/>
```

### SettlementRow

Displays a settlement (who owes whom) with a clear direction arrow and amount.

**Location:** `@/components/ui/SettlementRow`

**Props Interface:**
```typescript
interface SettlementRowProps {
  settlement: Settlement;
  
  /** Optional click handler to mark as completed */
  onMarkComplete?: () => void;  // triggers a server action
}
```

**Layout:**
- From Name → To Name | Amount | Status badge
- Direction clearly shown with arrow icon
- Tap to toggle status between pending/completed

**Usage:**
```typescript
import { SettlementRow } from '@/components/ui/SettlementRow';

<SettlementRow
  settlement={settlement}
  onMarkComplete={() => completeSettlement(settlement.id)}
/>
```

### StatCard

Displays a statistic: label + large amount + optional delta line.

**Location:** `@/components/ui/StatCard`

**Props Interface:**
```typescript
interface StatCardProps {
  label: string;
  
  /** Large amount value */
  amount: string;
  
  /** Optional delta value (e.g., "+$25.50") */
  delta?: string;
  
  /** Sentiment color for amount */
  sentiment?: 'positive' | 'negative' | 'neutral';
  
  /** Optional icon */
  icon?: ReactNode;
}
```

**Usage:**
```typescript
import { StatCard } from '@/components/ui/StatCard';

<StatCard
  label="You are owed"
  amount="127.50"
  sentiment="positive"
/>

<StatCard
  label="You owe"
  amount="42.25"
  delta="-$5.00"
  sentiment="negative"
/>
```

### Card

Generic container component with raised surface styling.

**Location:** `@/components/ui/Card`

**Props Interface:**
```typescript
interface CardProps {
  children: ReactNode;
  
  /** Card variant */
  variant?: 'tight' | 'flush';
  
  /** Optional click handler */
  onClick?: () => void;
  
  /** Custom background color */
  backgroundColor?: string;
}
```

**Variants:**
- `tight` (default): Standard padding (md), border, rounded corners
- `flush`: No padding, just border and background

**Styling:**
- Background: `surfaceRaised` (white)
- Border: `border` color
- Border radius: `lg` (10px)

**Usage:**
```typescript
import { Card } from '@/components/ui/Card';

<Card variant="tight">
  <Text>Card content</Text>
</Card>

<Card variant="flush" onClick={handlePress}>
  {/* Borderless card */}
</Card>
```

### TransactionList

Container component for displaying multiple transactions with consistent styling.

**Location:** `@/components/ui/TransactionList`

**Props Interface:**
```typescript
interface TransactionListProps {
  transactions: Transaction[];
  
  /** Click handler for row */
  onRowClick?: (transaction: Transaction) => void;
  
  /** Show empty state if no transactions */
  showEmpty?: boolean;
}
```

**Usage:**
```typescript
import { TransactionList } from '@/components/ui/TransactionList';

<TransactionList
  transactions={transactions}
  showEmpty={true}
  onRowClick={(txn) => router.push(`/groups/${txn.groupId}/transactions/${txn.id}`)}
/>
```

## Feedback Components (3)

### Toast

Slide-in notification toast with auto-dismiss.

**Location:** `@/components/feedback/Toast`

**Props Interface:**
```typescript
interface ToastProps {
  /** Toast message */
  message: string;
  
  /** Toast type/severity */
  type?: 'success' | 'error' | 'info';
  
  /** Auto-dismiss delay in ms (default 3000) */
  duration?: number;
  
  /** Callback when toast disappears */
  onDismiss?: () => void;
}
```

**Animation:**
- Slide in from bottom over 180ms (easeOut)
- Auto-dismiss after duration (default 3s)
- Manual dismiss via swipe or button

**Usage:**
```typescript
import { useToast } from '@/hooks/useToast';

const { show } = useToast();

show({
  message: 'Transaction created successfully',
  type: 'success',
  duration: 3000
});
```

### EmptyState

Placeholder component shown when no data is available.

**Location:** `@/components/feedback/EmptyState`

**Props Interface:**
```typescript
interface EmptyStateProps {
  /** Display message (e.g., "No transactions yet") */
  message: string;
  
  /** Optional subtext */
  subtext?: string;
  
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  
  /** Optional icon */
  icon?: ReactNode;
}
```

**Usage:**
```typescript
import { EmptyState } from '@/components/feedback/EmptyState';

{transactions.length === 0 && (
  <EmptyState
    message="No transactions yet"
    subtext="Add the first one to get started"
    action={{
      label: "Add Transaction",
      onClick: () => router.push("/groups/new-transaction")
    }}
  />
)}
```

### LoadingIndicator

Minimal spinner component with delayed appearance.

**Location:** `@/components/feedback/LoadingIndicator`

**Props Interface:**
```typescript
interface LoadingIndicatorProps {
  /** Optional custom size (default 40) */
  size?: number;
  
  /** Optional delay before showing (default 300ms) */
  delay?: number;
  
  /** Optional label below spinner */
  label?: string;
}
```

**UX Rules:**
- Shows after 300ms delay (avoids flash on fast loads)
- Minimal design (single animated circle)
- Centered on screen/container

**Usage:**
```typescript
import { LoadingIndicator } from '@/components/feedback/LoadingIndicator';

{loading && <LoadingIndicator size={50} label="Loading..." />}
```

## Navigation Components (2)

### TabBar

Custom bottom navigation tab bar with Breakdown styling.

**Location:** `@/components/navigation/TabBar`

**Props Interface:**
```typescript
interface TabBarProps {
  /** Current active tab */
  activeTab: 'groups' | 'settings';
  
  /** Tab change handler */
  onTabChange: (tab: 'groups' | 'settings') => void;
  
  /** Badge count for groups tab (optional) */
  groupCount?: number;
}
```

**Tabs:**
- Groups: Primary app view
- Settings: User profile and preferences

**Styling:**
- Background: `surface`
- Active tab: `ink` text + underline
- Inactive tab: `inkMuted` text

**Usage:**
```typescript
import { TabBar } from '@/components/navigation/TabBar';

<TabBar
  activeTab={active}
  onTabChange={setActive}
  groupCount={myGroups.length}
/>
```

### ScreenHeader

Header component for screen titles with navigation buttons.

**Location:** `@/components/navigation/ScreenHeader`

**Props Interface:**
```typescript
interface ScreenHeaderProps {
  /** Screen title */
  title: string;
  
  /** Show back button */
  showBack?: boolean;
  
  /** Back button handler */
  onBack?: () => void;
  
  /** Right action button */
  rightAction?: {
    icon: ReactNode;
    onClick: () => void;
  };
}
```

**Usage:**
```typescript
import { ScreenHeader } from '@/components/navigation/ScreenHeader';

<ScreenHeader
  title="Group Details"
  showBack={true}
  onBack={() => router.back()}
  rightAction={{
    icon: <SettingsIcon />,
    onClick: openSettings
  }}
/>
```

---

## Component Organization

All components follow these conventions:

- **Props:** Typed with TypeScript interfaces, always exported
- **Sentiment colors:** Use pine (positive), brick (negative), ink (neutral)
- **Spacing:** Always use tokens.spacing values
- **Typography:** Always use tokens.typography fonts
- **Animation:** Uses tokens.animation.durations with easeOut
- **Testing:** Each component has corresponding unit tests in `__tests__/` directory

Use these components consistently across screens to maintain design coherence and reduce duplication.
