import { redirect, RedirectType } from 'next/navigation';
import config from './config';

export async function getReturnBackUrlFromSearchParams(
  searchParams: Promise<Record<string, string | undefined>>,
) {
  return (await searchParams)[config.returnBackUrlKey];
}

export function redirectToLogin(returnBackUrl?: string): never {
  redirect(config.loginRoute + createReturnBackSearchParam(returnBackUrl), RedirectType.replace);
}

export function createReturnBackSearchParam(returnBackUrl?: string) {
  return returnBackUrl ? `?${config.returnBackUrlKey}=${encodeURIComponent(returnBackUrl)}` : '';
}

export function createSessionExpirationTime() {
  return Date.now() + config.sessionExpirationInSeconds * 1000;
}
