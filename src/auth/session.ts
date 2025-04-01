import { cache } from 'react';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { env } from '@/env';
import { db, type User } from '@/db';

export type UserSession = Pick<User, 'id' | 'role'>;

const SESSION_COOKIE_KEY = 'session-id';

export const getUserSession = cache(async (): Promise<UserSession | null> => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId) {
    return null;
  }

  const session = await db.getSessionById(sessionId);

  if (!session) {
    return null;
  }

  return {
    id: session.userId,
    role: session.userRole,
  };
});

export async function createUserSession(user: UserSession) {
  const sessionId = randomBytes(512).toString('hex');

  await db.createSession({
    id: sessionId,
    userId: user.id,
    userRole: user.role,
    expirationTime: Date.now() + env.SESSION_EXPIRATION_IN_SECONDS * 1000,
  });

  await setSessionCookie(sessionId);
}

export async function deleteUserSession() {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId) {
    return;
  }

  await db.deleteSession(sessionId);
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
