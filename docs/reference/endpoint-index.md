# Backend Endpoint Index

Complete reference of all Breakdown backend REST endpoints, organized by feature domain.

## Auth Endpoints

### POST /auth/login

Authenticates a user with username and password credentials.

**Request Type:** `LoginRequest`
```typescript
{
  username: string;
  password: string;
}
```

**Response Type:** `ResponseStructure<LoginResponse>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Login successful';
  responseObject: {
    user: User;
    accessToken: string;
  };
}
```

**Error Cases:**
- `400` (Bad Request): Validation error (missing username/password)
  - Message: "Invalid username or password format"
- `400` (Bad Request): Invalid credentials
  - Message: "Invalid username or password"
- `500` (Server Error): Database or authentication service failure
  - Message: "Internal server error: [details]"

**Authentication:** None required (public endpoint)

**Cookie Handling:**
- Sets HttpOnly secure cookie with refresh token (not accessible to JavaScript)

**Used by:** `app/(auth)/login/page.tsx`

---

### POST /auth/refresh

Refreshes an expired access token using the refresh token.

**Request Type:** Empty body (token via cookie or secure storage)
```typescript
// Empty request body
```

**Response Type:** `ResponseStructure<{accessToken: string}>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Token refreshed';
  responseObject: {
    accessToken: string;
  };
}
```

**Error Cases:**
- `401` (Unauthorized): Refresh token missing or invalid
  - Message: "Refresh token missing or invalid"
- `401` (Unauthorized): Refresh token expired
  - Message: "Refresh token expired; re-authenticate required"
- `500` (Server Error): Service failure
  - Message: "Internal server error: [details]"

**Authentication:** Not required for this endpoint (uses refresh token directly)

**Trigger:** Called automatically when any endpoint returns 401 access token expired error

**Client Action:** On 401 response, clear tokens and redirect to login screen.

**Used by:** API interceptor middleware (auto-triggered)

---

## Group Endpoints

### GET /groups

Retrieves list of all groups the authenticated user is a member of.

**Request:** None (query parameters optional for sorting/filtering)

**Response Type:** `ResponseStructure<Group[]>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Groups retrieved successfully';
  responseObject: [
    {
      id: string;
      name: string;
      description: string;
      members: User[];
      createdBy: string;
      createdAt: string;
    }
    // ... more groups
  ];
}
```

**Error Cases:**
- `401` (Unauthorized): Missing or invalid access token
  - Message: "Unauthorized"
- `500` (Server Error): Database failure
  - Message: "Failed to retrieve groups"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Used by:** `app/(dashboard)/groups/page.tsx`

---

### POST /group

Creates a new expense group.

**Request Type:** `CreateGroupRequest`
```typescript
{
  name: string;              // Required
  description?: string;      // Optional
}
```

**Response Type:** `ResponseStructure<Group>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Group created successfully';
  responseObject: {
    id: string;
    name: string;
    description: string;
    members: User[];
    createdBy: string;
    createdAt: string;
  };
}
```

**Error Cases:**
- `400` (Bad Request): Validation error (missing name, empty string)
  - Message: "Group name is required"
- `400` (Bad Request): Duplicate group name
  - Message: "Group name already exists"
- `401` (Unauthorized): Invalid token
  - Message: "Unauthorized"
- `500` (Server Error): Database failure
  - Message: "Failed to create group"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Used by:** `app/(dashboard)/groups/new/page.tsx`

---

### GET /group/{groupId}

Retrieves detailed information about a specific group.

**Path Parameters:**
- `groupId` (string): UUID of the group

**Response Type:** `ResponseStructure<Group>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Group retrieved successfully';
  responseObject: {
    id: string;
    name: string;
    description: string;
    members: User[];
    createdBy: string;
    createdAt: string;
  };
}
```

**Error Cases:**
- `401` (Unauthorized): Invalid token
  - Message: "Unauthorized"
- `404` (Not Found): Group not found
  - Message: "Group not found"
- `403` (Forbidden): User is not a member of this group
  - Message: "Access denied: not a member of this group"
- `500` (Server Error): Database failure
  - Message: "Failed to retrieve group details"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Used by:**
- `app/(dashboard)/groups/[id]/page.tsx`

---

## Transaction Endpoints

### GET /group/{groupId}/transaction-list

Retrieves all transactions for a specific group.

**Path Parameters:**
- `groupId` (string): UUID of the group

**Query Parameters (optional):**
- `category` (string): Filter by category (food, transport, utilities, entertainment, other)
- `payerId` (string): Filter by payer user ID
- `limit` (number): Max number of results (default 50)
- `offset` (number): Pagination offset (default 0)

**Response Type:** `ResponseStructure<Transaction[]>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Transactions retrieved successfully';
  responseObject: [
    {
      id: string;
      groupId: string;
      payerId: string;
      description: string;
      amount: string;        // BigDecimal as string (e.g., "89.50")
      category: string;
      timestamp: string;
    }
    // ... more transactions
  ];
}
```

**Error Cases:**
- `401` (Unauthorized): Invalid token
  - Message: "Unauthorized"
- `404` (Not Found): Group not found
  - Message: "Group not found"
- `403` (Forbidden): User not a member of group
  - Message: "Access denied: not a member of this group"
- `500` (Server Error): Database failure
  - Message: "Failed to retrieve transactions"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Used by:** `app/(dashboard)/groups/[id]/transactions/page.tsx`

---

### POST /group/{groupId}/insert-transaction

Creates a new transaction in the specified group.

**Path Parameters:**
- `groupId` (string): UUID of the group

**Request Type:** `TransactionCreateRequest`
```typescript
{
  payerId: string;           // Required: user ID of person who paid
  description: string;       // Required: what was purchased
  amount: string;            // Required: amount as decimal string (e.g., "89.50")
  category: string;          // Required: food|transport|utilities|entertainment|other
}
```

**Response Type:** `ResponseStructure<Transaction>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Transaction created successfully';
  responseObject: {
    id: string;
    groupId: string;
    payerId: string;
    description: string;
    amount: string;
    category: string;
    timestamp: string;
  };
}
```

**Error Cases:**
- `400` (Bad Request): Validation errors
  - "Invalid amount: must be greater than 0"
  - "Invalid category: [provided value]"
  - "Description is required"
  - "Payer user not found"
- `401` (Unauthorized): Invalid token
  - Message: "Unauthorized"
- `404` (Not Found): Group not found
  - Message: "Group not found"
- `403` (Forbidden): User not a member of group
  - Message: "Access denied: not a member of this group"
- `500` (Server Error): Database failure
  - Message: "Failed to create transaction"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Validation Rules:**
- Amount must be > 0 and valid BigDecimal format
- Category must be one of the valid enum values
- Description cannot be empty
- Payer must be an existing user

**Used by:** `app/(dashboard)/groups/[id]/actions.ts` (server action)

---

## Settlement Endpoints

### GET /group/{groupId}/settlements

Retrieves all settlements (who owes whom) for a group.

**Path Parameters:**
- `groupId` (string): UUID of the group

**Query Parameters (optional):**
- `status` (string): Filter by status (pending or completed)
- `userId` (string): Filter settlements involving specific user

**Response Type:** `ResponseStructure<Settlement[]>`
```typescript
{
  responseStatus: 'SUCCESS';
  responseMessage: 'Settlements retrieved successfully';
  responseObject: [
    {
      id: string;
      groupId: string;
      fromUserId: string;
      toUserId: string;
      amount: string;        // BigDecimal as string
      status: string;        // "pending" or "completed"
      createdAt: string;
    }
    // ... more settlements
  ];
}
```

**Error Cases:**
- `401` (Unauthorized): Invalid token
  - Message: "Unauthorized"
- `404` (Not Found): Group not found
  - Message: "Group not found"
- `403` (Forbidden): User not a member of group
  - Message: "Access denied: not a member of this group"
- `500` (Server Error): Database failure
  - Message: "Failed to retrieve settlements"

**Authentication:** Required (`Authorization: Bearer <accessToken>`)

**Used by:** `app/(dashboard)/groups/[id]/settlements/page.tsx`

---

## Response Status Reference

All endpoints return HTTP 200 with outcome indicated in `responseStatus` field:
- `SUCCESS`: Operation completed successfully
- `FAILURE`: Operation failed; check `responseMessage` for details

Clients should always check `responseStatus` in the response wrapper, not HTTP status codes, to determine outcome.

## Authentication Header Format

For all protected endpoints, include:
```
Authorization: Bearer <accessToken>
```

Example using fetch:
```typescript
const response = await fetch('/groups', {
  headers: {
    'Authorization': `Bearer ${accessToken}`,
    'Content-Type': 'application/json'
  }
});
```

## Error Handling Pattern

Always follow this pattern for all endpoints:

```typescript
const response = await fetch(endpoint, options);
const data = await response.json(); // Parse as ResponseStructure<T>

if (data.responseStatus === 'SUCCESS') {
  // Handle success - use data.responseObject
  processData(data.responseObject);
} else {
  // Handle failure - display data.responseMessage
  showError(data.responseMessage);
  
  // Special handling for 401
  if (response.status === 401) {
    refreshTokenAndRetry();
  }
}
```

This ensures consistent error handling and proper token refresh across the app.
