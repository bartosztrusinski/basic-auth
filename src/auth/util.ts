import { cookies } from 'next/headers';
import { redirect, RedirectType } from 'next/navigation';
import { env } from '@/env';

const SESSION_COOKIE_KEY = 'session-id';
const RETURN_BACK_URL_KEY = 'callback_url';

export async function getReturnBackUrlFromSearchParams(
  searchParams: Promise<Record<string, string | undefined>>,
) {
  return (await searchParams)[RETURN_BACK_URL_KEY];
}

export function redirectToLogin(returnBackUrl?: string | URL) {
  redirect(`/log-in${createReturnBackSearchParam(returnBackUrl)}`, RedirectType.replace);
}

export function createReturnBackSearchParam(returnBackUrl?: string | URL) {
  return returnBackUrl
    ? `?${RETURN_BACK_URL_KEY}=${encodeURIComponent(returnBackUrl.toString())}`
    : '';
}

export function createSessionExpirationTime() {
  return Date.now() + env.SESSION_EXPIRATION_IN_SECONDS * 1000;
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: env.SESSION_EXPIRATION_IN_SECONDS,
    path: '/',
  });
}

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_KEY)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_KEY);
}
