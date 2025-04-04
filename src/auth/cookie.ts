import { env } from '@/env';
import { cookies } from 'next/headers';

const SESSION_COOKIE_KEY = 'session-id';

export async function getSessionCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(SESSION_COOKIE_KEY)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_KEY);
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
