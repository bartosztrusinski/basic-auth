import { redirect, RedirectType } from 'next/navigation';
import { env } from '@/env';

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
