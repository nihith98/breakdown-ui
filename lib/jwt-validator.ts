/**
 * JWT Signature Validation & Claim Extraction
 *
 * Validates JWT signature using RS256 algorithm
 * Automatically validates standard claims: exp, iat, nbf
 */

import { jwtVerify, importSPKI } from 'jose';
import { getPublicKey } from './jwt-config';

export interface ValidatedTokenPayload {
  sub: string; // User ID (subject)
  username: string;
  email?: string;
  scope?: string; // Space-separated scopes
  displayName?: string;
  iat: number; // Issued at (unix timestamp)
  exp: number; // Expiration (unix timestamp)
  [key: string]: any; // Allow additional claims
}

/**
 * Validate JWT signature and claims
 *
 * Validates:
 * - Signature using RS256 with public key
 * - Token expiration (exp)
 * - Issued at time (iat)
 * - Not before time (nbf)
 * - Required claims (sub, username)
 *
 * Throws error if validation fails
 */
export async function validateJWT(token: string): Promise<ValidatedTokenPayload> {
  try {
    // Get public key (from cache or JWKS endpoint)
    let publicKeyPEM = await getPublicKey();

    // Handle escaped newlines in environment variable format (e.g., from .env file)
    publicKeyPEM = publicKeyPEM.replace(/\\n/g, '\n');

    // Convert PEM to KeyObject for jose
    const publicKey = await importSPKI(publicKeyPEM, 'RS256');

    // Verify signature and validate claims
    // jose automatically validates: exp, iat, nbf
    const verified = await jwtVerify(token, publicKey, {
      algorithms: ['RS256'],
    });

    const payload = verified.payload as ValidatedTokenPayload;

    // Validate required claims
    if (!payload.sub || typeof payload.sub !== 'string') {
      throw new Error('Missing or invalid "sub" claim');
    }

    if (!payload.username || typeof payload.username !== 'string') {
      throw new Error('Missing or invalid "username" claim');
    }

    return payload;
  } catch (error: any) {
    // Parse jose error codes
    if (error.code === 'ERR_JWT_EXPIRED') {
      console.warn('[JWT] Token validation failed: token expired');
      throw new Error('Token expired');
    }

    if (error.code === 'ERR_JWS_SIGNATURE_VERIFICATION_FAILED') {
      console.warn('[JWT] Token validation failed: invalid signature');
      throw new Error('Invalid signature');
    }

    if (error.code === 'ERR_JWT_MALFORMED') {
      console.warn('[JWT] Token validation failed: malformed JWT');
      throw new Error('Malformed JWT');
    }

    if (error.message?.includes('claim')) {
      console.warn(`[JWT] Token validation failed: ${error.message}`);
      throw error;
    }

    console.warn(`[JWT] Token validation failed: ${error.message}`);
    throw new Error(`JWT validation failed: ${error.message}`);
  }
}

/**
 * Extract user context from validated JWT payload
 *
 * Returns structured user information derived from JWT claims
 */
export function extractUserContext(payload: ValidatedTokenPayload) {
  return {
    userId: payload.sub,
    username: payload.username,
    email: payload.email || undefined,
    displayName: payload.displayName || payload.username,
    scopes: payload.scope ? payload.scope.split(' ') : [],
  };
}

/**
 * Decode JWT without validation (for debugging)
 *
 * SECURITY WARNING: Does not validate signature!
 * Only use for logging/debugging, never for security decisions.
 */
export function decodeJWTWithoutValidation(token: string): Partial<ValidatedTokenPayload> | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Convert URL-safe base64 to standard base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    // Add padding if needed
    const padding = base64.length % 4;
    if (padding) {
      base64 += '='.repeat(4 - padding);
    }

    const decoded = JSON.parse(Buffer.from(base64, 'base64').toString());
    return decoded as Partial<ValidatedTokenPayload>;
  } catch (error) {
    return null;
  }
}
