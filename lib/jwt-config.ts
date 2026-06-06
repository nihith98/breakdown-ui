/**
 * JWT Configuration & Public Key Management
 *
 * Loads public key from:
 * 1. JWKS endpoint (preferred - supports key rotation)
 * 2. JWT_PUBLIC_KEY environment variable (fallback)
 *
 * Keys are cached in-memory with 1-hour TTL for performance.
 */

interface JWKSKey {
  kty: string;
  use: string;
  alg: string;
  n: string;
  e: string;
  kid?: string;
  exp?: number;
  pem?: string;
}

interface JWKSResponse {
  keys: JWKSKey[];
}

// Simple in-memory cache for public key
let keyCache: { key: string; timestamp: number } | null = null;
const KEY_CACHE_TTL = 3600000; // 1 hour in milliseconds

/**
 * Convert JWK to PEM format
 * For now, expect the backend to provide PEM directly in the 'pem' field
 */
function convertJWKToPEM(key: JWKSKey): string | null {
  // If backend provides PEM directly, use it
  if (key.pem) {
    return key.pem;
  }

  // TODO: If backend provides only JWK fields (n, e), use jwk-to-pem library
  // For now, return null and fall back to env var
  console.warn('[JWT] JWK provided without PEM field. Using JWT_PUBLIC_KEY from environment.');
  return null;
}

/**
 * Fetch JWKS from backend endpoint
 * Supports key rotation - always gets latest keys
 */
async function fetchJWKSFromBackend(): Promise<JWKSResponse | null> {
  try {
    const jwksUrl = process.env.BACKEND_JWKS_URL;
    if (!jwksUrl) {
      console.debug('[JWT] BACKEND_JWKS_URL not configured, skipping JWKS fetch');
      return null;
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 5000); // 5 second timeout

    const response = await fetch(jwksUrl, {
      method: 'GET',
      cache: 'no-store',
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      console.error(`[JWT] JWKS fetch failed: ${response.status} ${response.statusText}`);
      return null;
    }

    const data: JWKSResponse = await response.json();
    return data;
  } catch (error) {
    console.error('[JWT] Failed to fetch JWKS:', error instanceof Error ? error.message : error);
    return null;
  }
}

/**
 * Get public key PEM for JWT validation
 * Tries JWKS endpoint first, falls back to environment variable
 *
 * Throws error if no key is available
 */
export async function getPublicKey(): Promise<string> {
  // Check in-memory cache
  if (keyCache && Date.now() - keyCache.timestamp < KEY_CACHE_TTL) {
    console.debug('[JWT] Using cached public key');
    return keyCache.key;
  }

  // Try JWKS endpoint
  console.debug('[JWT] Fetching JWKS from backend');
  const jwks = await fetchJWKSFromBackend();

  if (jwks?.keys?.[0]) {
    const firstKey = jwks.keys[0];
    const pem = convertJWKToPEM(firstKey);

    if (pem) {
      console.debug('[JWT] Got public key from JWKS endpoint');
      keyCache = { key: pem, timestamp: Date.now() };
      return pem;
    }
  }

  // Fallback to environment variable
  const envKey = process.env.JWT_PUBLIC_KEY;
  if (envKey) {
    console.debug('[JWT] Using JWT_PUBLIC_KEY from environment (static key)');
    keyCache = { key: envKey, timestamp: Date.now() };
    return envKey;
  }

  throw new Error(
    'No public key available for JWT validation. ' +
    'Configure BACKEND_JWKS_URL or JWT_PUBLIC_KEY environment variable.'
  );
}

/**
 * Invalidate cached public key
 * Useful when key rotation is detected
 */
export function invalidateKeyCache(): void {
  console.debug('[JWT] Invalidating key cache');
  keyCache = null;
}

/**
 * Get cache status (for monitoring/debugging)
 */
export function getKeyCacheStatus() {
  return {
    isCached: keyCache !== null,
    age: keyCache ? Date.now() - keyCache.timestamp : null,
    ttl: KEY_CACHE_TTL,
  };
}
