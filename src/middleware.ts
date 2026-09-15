import { NextResponse, type NextRequest } from 'next/server';
import { SESSION_COOKIE_NAME, verifySession } from '@/lib/auth/session';

// A coarse first gate — see .claude/rules/nextjs-app-router.md. Every /api/admin/** handler
// calls requireAdmin() itself as well, so this matcher being right is an optimisation, not the
// security control.
export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*'],
};

const BYPASS_PATHS = new Set(['/admin/login', '/api/admin/login']);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (BYPASS_PATHS.has(pathname)) {
    return NextResponse.next();
  }

  const token = request.cookies.get(SESSION_COOKIE_NAME)?.value;
  // verifySession treats a missing, tampered or expired token identically — all resolve to null.
  const session = token ? await verifySession(token) : null;

  if (session) {
    return NextResponse.next();
  }

  // API callers get 401 JSON, never a redirect — a redirect to an HTML page is not something an
  // API client can interpret. Page requests redirect to sign-in.
  if (pathname.startsWith('/api/')) {
    return NextResponse.json(
      { error: { code: 'UNAUTHORIZED', message: 'Authentication required.' } },
      { status: 401 },
    );
  }

  return NextResponse.redirect(new URL('/admin/login', request.url));
}
