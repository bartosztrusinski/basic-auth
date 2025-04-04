import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { createReturnBackSearchParam } from '@/auth/util';

// TODO create auth config
const SESSION_COOKIE_KEY = 'session-id';
const privateRoutes = ['/private', '/profile'];
const adminRoutes = ['/admin'];
const authRoutes = ['/log-in', '/sign-up'];

export function authMiddleware(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;
  const isAuthenticated = request.cookies.has(SESSION_COOKIE_KEY);
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  const isProtectedRoute = [...privateRoutes, ...adminRoutes].some((route) =>
    pathname.startsWith(route),
  );

  if (isAuthRoute && isAuthenticated) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  if (isProtectedRoute && !isAuthenticated) {
    return NextResponse.redirect(
      new URL('/log-in' + createReturnBackSearchParam(pathname), request.url),
    );
  }

  return NextResponse.next();
}
