import { NextRequest, NextResponse } from 'next/server';

const PUBLIC_PATHS = ['/login', '/register'];
// API routes handle their own auth and return 401 JSON — never redirect them.
// Only page routes get the login redirect.
const BYPASS_PREFIXES = ['/api/', '/_next/', '/favicon.ico'];

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.includes(pathname)) return true;
  return BYPASS_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function decodeJwtExpiry(token: string): number | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // Convert URL-safe base64 to standard base64
    let base64 = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = base64.length % 4;
    if (padding) base64 += '='.repeat(4 - padding);

    const payload = JSON.parse(atob(base64));
    return typeof payload.exp === 'number' ? payload.exp : null;
  } catch {
    return null;
  }
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;

  if (isPublicPath(pathname)) {
    return NextResponse.next();
  }

  const accessToken = request.cookies.get('access-token')?.value;
  const refreshToken = request.cookies.get('refresh-token')?.value;
  const now = Math.floor(Date.now() / 1000);

  const tokenExp = accessToken ? decodeJwtExpiry(accessToken) : null;
  const isTokenValid = tokenExp !== null && tokenExp > now + 60;

  if (isTokenValid) {
    return NextResponse.next();
  }

  // Token missing or expiring within 60s — attempt refresh if we have a refresh token
  if (refreshToken) {
    try {
      const refreshUrl = new URL('/api/auth/refresh', request.url);
      const refreshResponse = await fetch(refreshUrl.toString(), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (refreshResponse.ok) {
        const data = await refreshResponse.json();
        const newAccessToken: string | undefined = data.accessToken;

        if (newAccessToken) {
          const response = NextResponse.next();
          response.cookies.set('access-token', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 900,
            path: '/',
          });
          return response;
        }
      }
    } catch {
      // Refresh fetch failed — fall through to redirect
    }
  }

  // No valid token and refresh failed or unavailable — redirect to login
  const loginUrl = new URL('/login', request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};
