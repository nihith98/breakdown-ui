# API Response Contract

This document defines the shape of all responses from the Breakdown backend API, including domain models, error handling, and authentication flow.

## ResponseStructure Wrapper

All API responses, whether successful or failed, are wrapped in a unified `ResponseStructure<T>` object:

```json
{
  "responseStatus": "SUCCESS" | "FAILURE",
  "responseMessage": "Human-readable message",
  "responseObject": {} | null
}
```

**Fields:**
- `responseStatus` (string): Either `'SUCCESS'` or `'FAILURE'`
- `responseMessage` (string): Description of the outcome (e.g., "User created successfully" or "Invalid credentials")
- `responseObject` (T | null): The response payload for successful requests; null for failures

**Important:** Both successful and failure responses use this same wrapper structure. Always check `responseStatus` first, not HTTP status codes.

## Domain Types

### User

Represents an authenticated user in the system.

```json
{
  "id": "user-uuid-here",
  "username": "alice",
  "name": "Alice Cooper",
  "createdAt": "2026-01-15T10:30:00Z"
}
```

**Fields:**
- `id` (string): Unique user identifier (UUID)
- `username` (string): User's login username (no PII — not an email address)
- `name` (string): User's display name
- `createdAt` (ISO 8601): Timestamp when user account was created (UTC)

### Group

Represents an expense-splitting group.

```json
{
  "id": "group-uuid-here",
  "name": "Summer Trip 2026",
  "description": "Expenses for the annual team outing",
  "members": [
    {
      "id": "user-uuid-1",
      "username": "alice",
      "name": "Alice Cooper",
      "createdAt": "2026-01-15T10:30:00Z"
    },
    {
      "id": "user-uuid-2",
      "username": "bob",
      "name": "Bob Smith",
      "createdAt": "2026-02-01T14:22:00Z"
    }
  ],
  "createdBy": "user-uuid-1",
  "createdAt": "2026-03-10T09:15:00Z"
}
```

**Fields:**
- `id` (string): Unique group identifier (UUID)
- `name` (string): Display name of the group
- `description` (string): Optional description of the group's purpose
- `members` (User[]): Array of User objects who are members
- `createdBy` (string): User ID of the person who created the group
- `createdAt` (ISO 8601): Timestamp when group was created (UTC)

### Transaction

Represents a single expense recorded within a group.

```json
{
  "id": "transaction-uuid-here",
  "groupId": "group-uuid-here",
  "payerId": "user-uuid-1",
  "description": "Restaurant dinner",
  "amount": "89.50",
  "category": "food",
  "timestamp": "2026-05-20T19:45:00Z"
}
```

**Fields:**
- `id` (string): Unique transaction identifier (UUID)
- `groupId` (string): ID of the group this transaction belongs to
- `payerId` (string): User ID of the person who paid
- `description` (string): Description of the expense (e.g., "dinner at Mario's")
- `amount` (string): Transaction amount as BigDecimal in string format (e.g., "89.50"); always includes cents
- `category` (string): Expense category (food, transport, utilities, entertainment, other)
- `timestamp` (ISO 8601): When the transaction occurred (UTC)

### Settlement

Represents a payment owed between two group members.

```json
{
  "id": "settlement-uuid-here",
  "groupId": "group-uuid-here",
  "fromUserId": "user-uuid-2",
  "toUserId": "user-uuid-1",
  "amount": "25.75",
  "status": "pending",
  "createdAt": "2026-05-21T10:00:00Z"
}
```

**Fields:**
- `id` (string): Unique settlement identifier (UUID)
- `groupId` (string): ID of the group this settlement relates to
- `fromUserId` (string): User ID of the person who owes money
- `toUserId` (string): User ID of the person owed money
- `amount` (string): Amount owed as BigDecimal in string format
- `status` (string): Either `'pending'` (not yet paid) or `'completed'` (marked as paid)
- `createdAt` (ISO 8601): Timestamp when settlement was created (UTC)

## Error Responses

All error responses have `responseStatus: 'FAILURE'` and `responseObject: null`. The error reason is conveyed in `responseMessage`.

### 401 Unauthorized

```json
{
  "responseStatus": "FAILURE",
  "responseMessage": "Token expired or invalid",
  "responseObject": null
}
```

**Occurs when:**
- Access token is missing or malformed
- Access token has expired (client should refresh)
- Refresh token is invalid or expired (user must re-authenticate)

**Client action:** Redirect to login screen; or call POST /auth/refresh if refresh token exists.

### 400 Bad Request

```json
{
  "responseStatus": "FAILURE",
  "responseMessage": "Invalid email format in request body",
  "responseObject": null
}
```

**Occurs when:**
- Request body fails validation (missing required fields, wrong types)
- Invalid enum value (e.g., unknown transaction category)
- Constraint violation (e.g., duplicate username on signup)

**Client action:** Validate form before submission; display `responseMessage` to user.

### 500 Server Error

```json
{
  "responseStatus": "FAILURE",
  "responseMessage": "Internal server error: unexpected database failure",
  "responseObject": null
}
```

**Occurs when:**
- Unexpected database error
- Service dependency failure
- Code exception not caught by specific handlers

**Client action:** Log the error; show generic "Something went wrong" message; optionally retry.

## Authentication Flow

### POST /auth/login

Authenticates a user with username and password.

**Request:**
```json
{
  "username": "alice",
  "password": "secure-password-123"
}
```

**Response (Success):**
```json
{
  "responseStatus": "SUCCESS",
  "responseMessage": "Login successful",
  "responseObject": {
    "user": {
      "id": "user-uuid-here",
      "username": "alice",
      "name": "Alice Cooper",
      "createdAt": "2026-01-15T10:30:00Z"
    },
    "accessToken": "eyJhbGc..."
  }
}
```

**Response (Failure - Invalid Credentials):**
```json
{
  "responseStatus": "FAILURE",
  "responseMessage": "Invalid username or password",
  "responseObject": null
}
```

**Cookies:**
- Refresh token stored in HttpOnly secure cookie; not accessible to JavaScript

**Status codes:** 200 for all responses (success/failure distinction in responseStatus)

### POST /auth/refresh

Refreshes an expired access token using the refresh token.

**Request:**
- Web: Cookie sent automatically; no body
- Native: Include refresh token in Authorization header or body

**Response (Success):**
```json
{
  "responseStatus": "SUCCESS",
  "responseMessage": "Token refreshed",
  "responseObject": {
    "accessToken": "eyJhbGc..."
  }
}
```

**Response (Failure - Expired Refresh Token):**
```json
{
  "responseStatus": "FAILURE",
  "responseMessage": "Refresh token expired; re-authenticate required",
  "responseObject": null
}
```

**When triggered:** Automatically when any API returns 401 (access token expired)

**Client action on 401 refresh response:** Clear stored tokens; redirect to login screen.

## Authenticated Requests

All authenticated endpoints require:

```
Authorization: Bearer <accessToken>
```

**Example:**
```
GET /groups
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

The access token is valid for ~15 minutes. If an endpoint returns 401, automatically call POST /auth/refresh to obtain a new token, then retry the original request.
