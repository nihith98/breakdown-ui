# API Integration Deep-Dive

## Architecture: Next.js API Routes as Middleware

Next.js API routes (`app/api/`) act as middleware between frontend and Java backend:

```
Client (Browser) → Next.js API Route → Java Backend (http://localhost:8080)
                  (HTTP-only cookies)    (Bearer token)
```

API routes handle:
- Authentication (HTTP-only cookies)
- Authorization checks
- Request/response transformation
- Error handling

---

## Axios Setup

Create an Axios instance for Java backend communication:

```typescript
// lib/api-client.ts
import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

export const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response logging (optional)
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API error:', error.response?.status, error.message);
    return Promise.reject(error);
  }
);

export default apiClient;
```

Use in server-side code only (API routes, server actions, server components).

---

## Response Structure Handler

All Java backend responses follow `ResponseStructure<T>`. The backend always returns HTTP 200; check `responseStatus` to determine success or failure:

```typescript
// lib/response-handler.ts
export interface ResponseStructure<T = unknown> {
  responseStatus: 'SUCCESS' | 'FAILURE';
  responseMessage: string;
  responseObject: T | null;
}

export function handleResponseStructure<T>(response: ResponseStructure<T>): T {
  if (response.responseStatus === 'FAILURE') {
    throw new Error(response.responseMessage || 'Request failed');
  }
  return response.responseObject as T;
}
```

Use in server actions and API routes. Note: `apiClient.post()` returns an Axios Response — pass `response.data` (the parsed JSON body) to `handleResponseStructure`:

```typescript
// app/(dashboard)/groups/[id]/actions.ts ('use server')
'use server';

import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(groupId: string, input: any) {
  const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
  return handleResponseStructure(response.data);
}
```

---

## API Routes: Middleware to Backend

API routes proxy requests to Java backend and handle authentication:

```typescript
// app/api/groups/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function GET(request: NextRequest) {
  try {
    // Get auth token from HTTP-only cookie
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Call Java backend with token
    const response = await apiClient.get('/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });

    // Return responseObject to client (strip wrapper)
    return NextResponse.json(handleResponseStructure(response.data));
  } catch (error: any) {
    console.error('GET /api/groups error:', error.message);
    return NextResponse.json({ error: 'Failed to fetch groups' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();

    const response = await apiClient.post('/groups', body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(handleResponseStructure(response.data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

## Authentication: HTTP-Only Cookies

Login API route sets HTTP-only cookie:

```typescript
// app/api/auth/login/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();

    // Call Java backend
    const response = await apiClient.post('/auth/login', { username, password });
    const data = handleResponseStructure(response.data);

    // Set HTTP-only cookie (not accessible from JavaScript)
    const res = NextResponse.json({ success: true, user: data });
    res.cookies.set('auth-token', data.token, {
      httpOnly: true,               // Can't be accessed from JS
      secure: process.env.NODE_ENV === 'production',  // HTTPS only in production
      sameSite: 'lax',              // CSRF protection
      maxAge: 60 * 60 * 24 * 7,     // 7 days
    });

    return res;
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

Client-side login call:

```typescript
// components/LoginForm.tsx ('use client')
'use client';

import { useState } from 'react';

export function LoginForm() {
  async function handleLogin(username: string, password: string) {
    const response = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });

    if (!response.ok) {
      throw new Error('Login failed');
    }

    // Redirect to dashboard (cookies are sent automatically)
    window.location.href = '/groups';
  }

  return <form onSubmit={() => handleLogin(...)}>.../form>;
}
```

**Token is never exposed to JavaScript.** It's sent automatically with every API request in cookies.

---

## Dynamic Routes

Handle route parameters in `app/api/groups/[id]/route.ts`:

```typescript
// app/api/groups/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { apiClient } from '@/lib/api-client';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const response = await apiClient.get(`/groups/${params.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(handleResponseStructure(response.data));
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to fetch group' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const response = await apiClient.put(`/groups/${params.id}`, body, {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(handleResponseStructure(response.data));
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 400 });
  }
}
```

---

## Server Actions (Direct Backend Calls)

Server actions can call the backend directly without going through API routes:

```typescript
// app/(dashboard)/groups/[id]/actions.ts ('use server')
'use server';

import { cookies } from 'next/headers';
import { apiClient } from '@/lib/api-client';
import { handleResponseStructure } from '@/lib/response-handler';

export async function addExpense(
  groupId: string,
  input: { description: string; amount: number }
) {
  const cookieStore = cookies();
  const token = cookieStore.get('auth-token')?.value;

  if (!token) {
    throw new Error('Unauthorized');
  }

  const response = await apiClient.post(`/groups/${groupId}/expenses`, input, {
    headers: { Authorization: `Bearer ${token}` },
  });

  return handleResponseStructure(response.data);
}
```

Called from client:

```typescript
// components/AddExpenseForm.tsx ('use client')
'use client';

import { addExpense } from '@/app/(dashboard)/groups/[id]/actions';

export function AddExpenseForm({ groupId }: { groupId: string }) {
  async function handleSubmit(e: React.FormEvent) {
    const result = await addExpense(groupId, { description, amount });
  }

  return <form onSubmit={handleSubmit}>...</form>;
}
```

---

## Error Handling

### API Route Errors

Return appropriate HTTP status codes:

```typescript
// app/api/groups/route.ts
export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value;
    if (!token) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const response = await apiClient.get('/groups', {
      headers: { Authorization: `Bearer ${token}` },
    });

    return NextResponse.json(handleResponseStructure(response.data));
  } catch (error: any) {
    if (error.response?.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
```

### Server Action Errors

Throw errors; they propagate to client:

```typescript
// app/(dashboard)/groups/[id]/actions.ts
'use server';

export async function addExpense(groupId: string, input: any) {
  try {
    const response = await apiClient.post(`/groups/${groupId}/expenses`, input);
    return handleResponseStructure(response).data;
  } catch (error: any) {
    // Error message sent to client
    throw new Error(error.response?.data?.responseMessage || 'Failed to add expense');
  }
}
```

---

## Environment Variables

Access from server-side code:

```typescript
// lib/api-client.ts
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';
```

For server-side-only secrets:

```typescript
// .env.local (never commit)
DATABASE_URL=...
SECRET_KEY=...
```

---

## See Also

- [`server-actions.md`](server-actions.md) — using server actions for mutations
- [`authentication.md`](authentication.md) — detailed auth flow with cookies
