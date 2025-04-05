import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import config from './config';

export async function getSessionCookie(request?: NextRequest) {
  if (request) {
    return request.cookies.get(config.sessionCookieKey)?.value;
  }

  const cookieStore = await cookies();
  return cookieStore.get(config.sessionCookieKey)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(config.sessionCookieKey);
}

export async function setSessionCookie(sessionId: string, request?: NextRequest) {
  if (request) {
    request.cookies.set({
      name: config.sessionCookieKey,
      value: sessionId,
      ...config.sessionCookieAttributes,
    });
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(config.sessionCookieKey, sessionId, config.sessionCookieAttributes);
}
