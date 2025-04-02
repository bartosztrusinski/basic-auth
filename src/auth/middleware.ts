import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';

// TODO create auth config
const privateRoutes = ['/private', '/profile'];
const adminRoutes = ['/admin'];
const SESSION_COOKIE_KEY = 'session-id';

export function authMiddleware(request: NextRequest): NextResponse {
  const isAuthenticated = request.cookies.has(SESSION_COOKIE_KEY);
  const isProtectedRoute = [...privateRoutes, ...adminRoutes].some((route) =>
    request.nextUrl.pathname.startsWith(route),
  );

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(new URL('/log-in', request.url));
  }

  return NextResponse.next();
}
