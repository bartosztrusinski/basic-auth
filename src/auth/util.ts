import { redirect, type RedirectType } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { type AuthCode } from '@/auth/message';
import config from '@/auth/config';

type Override<T, U> = Omit<T, keyof U> & U;

type Null<T extends Record<string, unknown>> = Record<keyof T, null>;

type FullOrNull<T extends Record<string, unknown>> = T | Null<T>;

type RedirectOptions = {
  type?: RedirectType;
  authCode?: AuthCode | null;
  returnBackUrl?: string | null;
};

function redirectAuth(
  url: string,
  { type, authCode }: Omit<RedirectOptions, 'returnBackUrl'> = {},
): never {
  const redirectUrl = new URL(url, config.baseUrl);

  if (authCode) {
    redirectUrl.searchParams.set(config.authCodeKey, authCode);
  }

  redirect(redirectUrl.toString(), type);
}

function isAuthRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.authRoutes.some((route) => pathname.startsWith(route));
}

function isProtectedRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return config.protectedRoutes.some((route) => pathname.startsWith(route));
}

function isApiAuthRoute(request: NextRequest) {
  const { pathname } = request.nextUrl;
  return pathname.startsWith(config.apiBaseRoute);
}

const fetcher = <T>(...args: Parameters<typeof fetch>) =>
  fetch(...args).then((res) => res.json() as T);

/** Shallow object comparison */
function isSameObject<T extends Record<string, unknown>>(objA: T, objB: T) {
  for (const key in objA) {
    if (objA[key as keyof T] !== objB[key as keyof T]) {
      return false;
    }
  }

  return true;
}

async function getSearchParam<T extends string>(
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

  return decodeURIComponent(value) as T;
}

export {
  redirectAuth,
  isAuthRoute,
  isProtectedRoute,
  isApiAuthRoute,
  fetcher,
  isSameObject,
  getSearchParam,
};
export type { Override, RedirectOptions, Null, FullOrNull };
