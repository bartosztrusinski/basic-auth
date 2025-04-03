import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { randomBytes } from 'node:crypto';
import { env } from '@/env';
import { db, type User } from '@/db';
import { redirect, RedirectType } from 'next/navigation';

type SessionUser = {
  userId: User['id'];
  userRole: User['role'];
};

export type Auth = Partial<SessionUser> & {
  redirectToLogin: typeof redirectToLogin;
};

export type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role'>;

const SESSION_COOKIE_KEY = 'session-id';

export const currentUser = cache<() => Promise<BackendUser | null>>(async () => {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const user = await db.getUserById(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
  } satisfies BackendUser;
});

export const auth = cache<() => Promise<Auth>>(async () => {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_KEY)?.value;
  const auth: Auth = {
    redirectToLogin,
  };

  if (!sessionId) {
    return auth;
  }

  const session = await db.getSessionById(sessionId);

  if (!session) {
    return auth;
  }

  const { userId, userRole } = session;

  return {
    ...auth,
    userId,
    userRole,
  } satisfies Auth;
});

export function redirectToLogin(returnBackUrl?: string | URL) {
  redirect(`/log-in${createReturnBackSearchParam(returnBackUrl)}`, RedirectType.replace);
}

export function createReturnBackSearchParam(returnBackUrl?: string | URL) {
  return returnBackUrl ? `?callbackUrl=${encodeURIComponent(returnBackUrl.toString())}` : '';
}

export async function createUserSession({ userId, userRole }: SessionUser) {
  const sessionId = randomBytes(512).toString('hex');

  await db.createSession({
    id: sessionId,
    userId,
    userRole,
    expirationTime: createSessionExpirationTime(),
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

export async function updateUserSession({ userId, userRole }: SessionUser) {
  const cookieStore = await cookies();
  const sessionId = cookieStore.get(SESSION_COOKIE_KEY)?.value;

  if (!sessionId) {
    return;
  }

  await db.updateSession(sessionId, {
    userId,
    userRole,
    expirationTime: createSessionExpirationTime(),
  });

  await setSessionCookie(sessionId);
}

async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE_KEY, sessionId, {
    secure: true,
    httpOnly: true,
    sameSite: 'lax',
    maxAge: env.SESSION_EXPIRATION_IN_SECONDS,
    path: '/',
  });
}

function createSessionExpirationTime() {
  return Date.now() + env.SESSION_EXPIRATION_IN_SECONDS * 1000;
}
