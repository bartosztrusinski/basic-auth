import 'server-only';
import { randomBytes } from 'node:crypto';
import { cache } from 'react';
import { db, type User } from '@/db';
import { createSessionExpirationTime, redirectToLogin } from './util';
import { getSessionCookie, setSessionCookie, deleteSessionCookie } from './cookie';

// TODO create protect api
// TODO update session expiration time in middleware

export type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role'>;

type SessionUser = {
  userId: User['id'];
  userRole: User['role'];
};

export type Auth = Partial<SessionUser> & {
  redirectToLogin: typeof redirectToLogin;
};

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
  const sessionId = await getSessionCookie();
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
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return;
  }

  await db.deleteSession(sessionId);
  await deleteSessionCookie();
}

export async function updateUserSession({ userId, userRole }: SessionUser) {
  const sessionId = await getSessionCookie();

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
