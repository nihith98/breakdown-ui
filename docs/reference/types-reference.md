# TypeScript Types Reference

This document defines all TypeScript interfaces used throughout the Breakdown frontend, organized by domain.

## Auth Types

### LoginRequest

```typescript
interface LoginRequest {
  /** User's email address */
  email: string;
  
  /** User's password */
  password: string;
}
```

**Example:**
```typescript
const request: LoginRequest = {
  email: "alice@example.com",
  password: "secure-password-123"
};
```

### LoginResponse

```typescript
interface LoginResponse {
  /** Authenticated user object */
  user: User;
  
  /** JWT access token for subsequent authenticated requests */
  accessToken: string;
}
```

**Example:**
```typescript
const response: LoginResponse = {
  user: {
    id: "user-123",
    email: "alice@example.com",
    name: "Alice Cooper",
    createdAt: "2026-01-15T10:30:00Z"
  },
  accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
};
```

### RefreshTokenRequest

```typescript
interface RefreshTokenRequest {
  // Empty: refresh token is sent via HttpOnly cookie (web) or secure storage (native)
}
```

**Usage:** POST /auth/refresh typically sends an empty body; token comes from cookie or storage.

### User

```typescript
interface User {
  /** Unique user identifier (UUID) */
  id: string;
  
  /** User's email address, used for login */
  email: string;
  
  /** User's display name */
  name: string;
  
  /** ISO 8601 timestamp when user account was created */
  createdAt: string;
}
```

**Example:**
```typescript
const user: User = {
  id: "user-uuid-123",
  email: "alice@example.com",
  name: "Alice Cooper",
  createdAt: "2026-01-15T10:30:00Z"
};
```

## Group Types

### Group

```typescript
interface Group {
  /** Unique group identifier (UUID) */
  id: string;
  
  /** Display name of the group */
  name: string;
  
  /** Optional description of group's purpose */
  description: string;
  
  /** Array of User objects who are members of this group */
  members: User[];
  
  /** User ID of the person who created this group */
  createdBy: string;
  
  /** ISO 8601 timestamp when group was created */
  createdAt: string;
}
```

**Example:**
```typescript
const group: Group = {
  id: "group-456",
  name: "Summer Trip 2026",
  description: "Annual team outing expenses",
  members: [
    { id: "user-1", email: "alice@example.com", name: "Alice Cooper", createdAt: "2026-01-15T10:30:00Z" },
    { id: "user-2", email: "bob@example.com", name: "Bob Smith", createdAt: "2026-02-01T14:22:00Z" }
  ],
  createdBy: "user-1",
  createdAt: "2026-03-10T09:15:00Z"
};
```

### GroupListItem

```typescript
interface GroupListItem {
  /** Unique group identifier */
  id: string;
  
  /** Display name of the group */
  name: string;
  
  /** Number of members in the group */
  memberCount: number;
  
  /** Total balance across all members (can be positive or negative) */
  totalBalance: string;
}
```

**Example:**
```typescript
const item: GroupListItem = {
  id: "group-456",
  name: "Summer Trip 2026",
  memberCount: 4,
  totalBalance: "127.50"
};
```

### CreateGroupRequest

```typescript
interface CreateGroupRequest {
  /** Display name for the new group */
  name: string;
  
  /** Optional description of the group's purpose */
  description?: string;
}
```

**Example:**
```typescript
const request: CreateGroupRequest = {
  name: "Roommate Expenses",
  description: "Shared apartment costs"
};
```

### UpdateGroupRequest

```typescript
interface UpdateGroupRequest {
  /** Optional new display name */
  name?: string;
  
  /** Optional new description */
  description?: string;
}
```

**Example:**
```typescript
const request: UpdateGroupRequest = {
  name: "Roommate Expenses 2026"
};
```

### GroupMember

```typescript
interface GroupMember {
  /** User ID of the group member */
  userId: string;
  
  /** Display name */
  name: string;
  
  /** Email address */
  email: string;
}
```

**Example:**
```typescript
const member: GroupMember = {
  userId: "user-1",
  name: "Alice Cooper",
  email: "alice@example.com"
};
```

## Transaction Types

### Transaction

```typescript
interface Transaction {
  /** Unique transaction identifier (UUID) */
  id: string;
  
  /** ID of the group this transaction belongs to */
  groupId: string;
  
  /** User ID of the person who paid */
  payerId: string;
  
  /** Description of the expense */
  description: string;
  
  /** Transaction amount as BigDecimal string (always includes cents, e.g. "89.50") */
  amount: string;
  
  /** Expense category */
  category: TransactionCategory;
  
  /** ISO 8601 timestamp when transaction occurred */
  timestamp: string;
}
```

**Example:**
```typescript
const transaction: Transaction = {
  id: "txn-789",
  groupId: "group-456",
  payerId: "user-1",
  description: "Restaurant dinner",
  amount: "89.50",
  category: "food",
  timestamp: "2026-05-20T19:45:00Z"
};
```

### TransactionCreateRequest

```typescript
interface TransactionCreateRequest {
  /** User ID of the person who paid */
  payerId: string;
  
  /** Description of the expense */
  description: string;
  
  /** Amount as BigDecimal string (e.g. "89.50") */
  amount: string;
  
  /** Expense category */
  category: TransactionCategory;
}
```

**Example:**
```typescript
const request: TransactionCreateRequest = {
  payerId: "user-1",
  description: "Restaurant dinner",
  amount: "89.50",
  category: "food"
};
```

### TransactionListItem

```typescript
interface TransactionListItem {
  /** Unique transaction identifier */
  id: string;
  
  /** User ID of the person who paid */
  payerId: string;
  
  /** Description of the expense */
  description: string;
  
  /** Transaction amount as string */
  amount: string;
  
  /** Expense category */
  category: TransactionCategory;
  
  /** ISO 8601 timestamp */
  timestamp: string;
}
```

**Example:**
```typescript
const item: TransactionListItem = {
  id: "txn-789",
  payerId: "user-1",
  description: "Restaurant dinner",
  amount: "89.50",
  category: "food",
  timestamp: "2026-05-20T19:45:00Z"
};
```

### TransactionCategory

```typescript
type TransactionCategory = 'food' | 'transport' | 'utilities' | 'entertainment' | 'other';
```

**Valid values:**
- `'food'` - Meals, groceries, restaurants
- `'transport'` - Taxis, gas, public transit
- `'utilities'` - Bills, subscriptions, utilities
- `'entertainment'` - Movies, events, activities
- `'other'` - Anything that doesn't fit categories above

**Example:**
```typescript
const category: TransactionCategory = 'food';
```

## Settlement Types

### Settlement

```typescript
interface Settlement {
  /** Unique settlement identifier (UUID) */
  id: string;
  
  /** ID of the group this settlement relates to */
  groupId: string;
  
  /** User ID of the person who owes money */
  fromUserId: string;
  
  /** User ID of the person owed money */
  toUserId: string;
  
  /** Amount owed as BigDecimal string */
  amount: string;
  
  /** Settlement status */
  status: SettlementStatus;
  
  /** ISO 8601 timestamp when settlement was created */
  createdAt: string;
}
```

**Example:**
```typescript
const settlement: Settlement = {
  id: "settle-999",
  groupId: "group-456",
  fromUserId: "user-2",
  toUserId: "user-1",
  amount: "25.75",
  status: "pending",
  createdAt: "2026-05-21T10:00:00Z"
};
```

### SettlementListItem

```typescript
interface SettlementListItem {
  /** Unique settlement identifier */
  id: string;
  
  /** Display name of the person who owes money */
  fromUserName: string;
  
  /** Display name of the person owed money */
  toUserName: string;
  
  /** Amount owed */
  amount: string;
  
  /** Settlement status */
  status: SettlementStatus;
}
```

**Example:**
```typescript
const item: SettlementListItem = {
  id: "settle-999",
  fromUserName: "Bob Smith",
  toUserName: "Alice Cooper",
  amount: "25.75",
  status: "pending"
};
```

### SettlementStatus

```typescript
type SettlementStatus = 'pending' | 'completed';
```

**Valid values:**
- `'pending'` - Payment not yet made
- `'completed'` - Payment completed and marked settled

**Example:**
```typescript
const status: SettlementStatus = 'pending';
```

## Usage Pattern

Import these types in your component files:

```typescript
import { User, Group, Transaction, Settlement } from '@/types';
import type { LoginRequest, LoginResponse } from '@/types/auth';
```

Always use these types to ensure consistency across the frontend and type safety during development.
