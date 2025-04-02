import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';

// TODO create auth config
const privateRoutes = ['/private', '/profile'];
const adminRoutes = ['/admin'];
const SESSION_COOKIE_KEY = 'session-id';

export function authMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(SESSION_COOKIE_KEY);
  const isProtectedRoute = [...privateRoutes, ...adminRoutes].some((route) =>
    pathname.startsWith(route),
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL(`/log-in?callbackUrl=${encodeURIComponent(pathname)}`, request.url),
    );
  }

  return NextResponse.next();
}
