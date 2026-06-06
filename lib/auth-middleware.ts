/**
 * JWT Validation Middleware for API Routes
 *
 * Extracts token from httpOnly cookie, validates signature,
 * extracts claims, and enriches headers for backend forwarding.
 *
 * Reusable across all protected API routes.
 */

import { NextRequest, NextResponse } from 'next/server';
import { validateJWT, extractUserContext, ValidatedTokenPayload } from './jwt-validator';

export interface RequestWithUser {
  user: ReturnType<typeof extractUserContext>;
  tokenPayload: ValidatedTokenPayload;
  enrichedHeaders: Record<string, string>;
}

/**
 * Validate JWT and extract enriched headers for backend forwarding
 *
 * Returns:
 * - user: Structured user context
 * - tokenPayload: Full JWT payload
 * - enrichedHeaders: Headers to forward to backend (includes Authorization)
 *
 * Returns null if token is missing or invalid (caller should return 401)
 */
export async function validateAndEnrichRequest(
  request: NextRequest
): Promise<RequestWithUser | null> {
  try {
    // Extract token from httpOnly cookie
    const token = request.cookies.get('access-token')?.value;
    if (!token) {
      console.debug('[Auth] No access-token cookie found');
      return null;
    }

    // Validate JWT signature and claims
    const payload = await validateJWT(token);

    // Extract user context
    const user = extractUserContext(payload);

    // Build enriched headers for backend
    const enrichedHeaders: Record<string, string> = {
      'Authorization': `Bearer ${token}`,
      'X-User-Id': user.userId,
      'X-Username': user.username,
      'X-User-Display-Name': user.displayName,
      'X-User-Scopes': user.scopes.join(' '),
    };

    if (user.email) {
      enrichedHeaders['X-User-Email'] = user.email;
    }

    console.debug(`[Auth] Token validated for user: ${user.username}`);

    return {
      user,
      tokenPayload: payload,
      enrichedHeaders,
    };
  } catch (error: any) {
    console.debug(`[Auth] Token validation error: ${error.message}`);
    return null;
  }
}

/**
 * Helper function to build 401 Unauthorized response
 */
export function buildUnauthorizedResponse(reason = 'Unauthorized'): NextResponse {
  return NextResponse.json({ error: reason }, { status: 401 });
}

/**
 * Helper function to build 500 Internal Server Error response
 */
export function buildErrorResponse(message: string): NextResponse {
  return NextResponse.json({ error: message }, { status: 500 });
}
