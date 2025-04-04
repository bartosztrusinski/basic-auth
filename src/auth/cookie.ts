import { cookies } from 'next/headers';
import { type NextRequest } from 'next/server';
import { env } from '@/env';

const SESSION_COOKIE_KEY = 'session-id';
const SESSION_COOKIE_OPTIONS = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: env.SESSION_EXPIRATION_IN_SECONDS,
  path: '/',
};

export async function getSessionCookie(request?: NextRequest) {
  if (request) {
    return request.cookies.get(SESSION_COOKIE_KEY)?.value;
  }

  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_KEY)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_KEY);
}

export async function setSessionCookie(sessionId: string, request?: NextRequest) {
  if (request) {
    request.cookies.set({
      name: SESSION_COOKIE_KEY,
      value: sessionId,
      ...SESSION_COOKIE_OPTIONS,
    });
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_KEY, sessionId, SESSION_COOKIE_OPTIONS);
}
