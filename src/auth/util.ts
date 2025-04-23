import { redirect, RedirectType } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { env } from '@/env';
import config from './config';
import oAuthConfig from './oauth/config';

type RedirectOptions = {
  returnBackUrl?: string | null;
  redirectReason?: string | null;
};

export async function getReturnBackSearchParam(
  searchParams: Promise<Record<string, string | undefined>> | undefined,
) {
  return getSearchParam(searchParams, config.returnBackUrlKey);
}

export async function getRedirectReasonSearchParam(
  searchParams: Promise<Record<string, string | undefined>> | undefined,
) {
  return getSearchParam(searchParams, config.redirectReasonKey);
}

export async function getAccountLinkErrorSearchParam(
  searchParams: Promise<Record<string, string | undefined>> | undefined,
) {
  return getSearchParam(searchParams, oAuthConfig.accountLinkErrorKey);
}

export function redirectToLogin({
  returnBackUrl,
  redirectReason = config.defaultRedirectReason,
}: RedirectOptions = {}): never {
  const redirectUrl = new URL(config.loginRoute, env.BASE_URL);
  if (redirectReason) {
    setRedirectReasonParam(redirectUrl, redirectReason);
  }

  if (returnBackUrl) {
    setReturnBackParam(redirectUrl, returnBackUrl);
  }

  redirect(redirectUrl.toString(), RedirectType.replace);
}

export function setReturnBackParam(url: URL, returnBackUrl: string) {
  url.searchParams.set(config.returnBackUrlKey, returnBackUrl);
}

export function setRedirectReasonParam(url: URL, redirectReason: string) {
  url.searchParams.set(config.redirectReasonKey, encodeURIComponent(redirectReason));
}

export function isAuthRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.authRoutes.some((route) => pathname.startsWith(route));
}

export function isProtectedRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.protectedRoutes.some((route) => pathname.startsWith(route));
}

export function isApiAuthRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return pathname.startsWith(config.apiBaseRoute);
}

export const fetcher = <T>(...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json() as T);

/** Shallow object comparison */
export function isSameObject<T extends Record<string, unknown>>(objA: T, objB: T) {
  for (const key in objA) {
    if (objA[key as keyof T] !== objB[key as keyof T]) {
      return false;
    }
  }

  return true;
}

async function getSearchParam(
  searchParams: Promise<Record<string, string | undefined>> | undefined,
  key: string,
) {
  if (!searchParams) {
    return null;
  }

  const params = await searchParams;

  if (!params) {
    return null;
  }

  const value = params[key];

  if (!value) {
    return null;
  }

  return decodeURIComponent(value);
}
