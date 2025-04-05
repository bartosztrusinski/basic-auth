import 'server-only';
import { redirect, RedirectType } from 'next/navigation';
import { type NextRequest, NextResponse } from 'next/server';
import config from './config';

export async function getReturnBackUrlFromSearchParams(
  searchParams: Promise<Record<string, string | undefined>>,
) {
  return (await searchParams)[config.returnBackUrlKey];
}

export function redirectToLogin(returnBackUrl?: string): never {
  redirect(config.loginRoute + createReturnBackSearchParam(returnBackUrl), RedirectType.replace);
}

export function redirectToLoginMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return NextResponse.redirect(
    new URL(config.loginRoute + createReturnBackSearchParam(pathname), request.url),
  );
}

export function redirectToDefaultMiddleware(request: NextRequest) {
  return NextResponse.redirect(new URL(config.defaultRedirectRoute, request.url));
}

export function createReturnBackSearchParam(returnBackUrl?: string) {
  return returnBackUrl ? `?${config.returnBackUrlKey}=${encodeURIComponent(returnBackUrl)}` : '';
}

export function createSessionExpirationTime() {
  return Date.now() + config.sessionExpirationInSeconds * 1000;
}

export function isAuthRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.authRoutes.some((route) => pathname.startsWith(route));
}

export function isProtectedRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.protectedRoutes.some((route) => pathname.startsWith(route));
}
