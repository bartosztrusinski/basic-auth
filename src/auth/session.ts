import 'server-only';
import { randomBytes } from 'node:crypto';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { db, type User } from '@/db';
import { createSessionExpirationTime, redirectToLogin } from './util';
import { getSessionCookie, setSessionCookie, deleteSessionCookie } from './cookie';

// TODO update session expiration time in middleware

type SessionUser = {
  userId: User['id'];
  userRole: User['role'];
};

export type Auth = Partial<SessionUser> & {
  redirectToLogin: typeof redirectToLogin;
};

interface AuthFunction {
  (): ReturnType<typeof authFn>;
  protect: typeof protect;
}

type ProtectOptions = {
  role?: User['role'];
  unauthorizedUrl?: string;
  unauthenticatedUrl?: string;
};

type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role'>;

export const auth: AuthFunction = Object.assign(cache(authFn), { protect });

async function authFn(): Promise<Auth> {
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
}

async function protect({ role, unauthorizedUrl, unauthenticatedUrl }: ProtectOptions = {}) {
  const { userId, userRole } = await auth();

  if (!userId) {
    return unauthenticatedUrl ? redirect(unauthenticatedUrl) : redirectToLogin();
  }

  if (userRole !== role) {
    return redirect(unauthorizedUrl ?? '/');
  }

  return { userId };
}

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
