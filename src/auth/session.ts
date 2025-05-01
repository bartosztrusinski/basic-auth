import 'server-only';
import { randomBytes } from 'node:crypto';
import { cache } from 'react';
import { redirect } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { db, type User } from '@/db';
import { redirectToLogin } from '@/auth/util';
import {
  getSessionCookie,
  setSessionCookie,
  deleteSessionCookie,
  setAuthSyncCookie,
} from '@/auth/cookie';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

type SessionUser = {
  userId: User['id'];
  userRole: User['role'];
  expirationTime?: number;
};

export type Auth = Partial<SessionUser> & {
  redirectToLogin: typeof redirectToLogin;
};

interface AuthFunction {
  (): ReturnType<() => Promise<Auth>>;
  protect: (options?: ProtectOptions) => Promise<{ userId: User['id'] }>;
}

type RedirectToLoginOptions = Parameters<typeof redirectToLogin>[0];

type ProtectOptions = {
  role?: User['role'];
  unauthorizedUrl?: string;
  unauthenticatedUrl?: string;
} & RedirectToLoginOptions;

export type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role'> & {
  hasPassword: boolean;
};

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

  const { userId, userRole, expirationTime } = session;

  return {
    ...auth,
    userId,
    userRole,
    expirationTime,
  } satisfies Auth;
}

async function protect({
  role,
  unauthorizedUrl,
  unauthenticatedUrl,
  ...redirectParams
}: ProtectOptions = {}) {
  const { userId, userRole } = await auth();

  try {
    await setAuthSyncCookie();
  } catch {
    console.info('Protect called from server component, sync auth cookie not set');
  }

  if (!userId) {
    if (unauthenticatedUrl) {
      redirect(unauthenticatedUrl);
    }

    redirectToLogin(redirectParams);
  }

  if (role && userRole !== role) {
    redirect(unauthorizedUrl ?? config.defaultRedirectRoute);
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
    hasPassword: Boolean(user.password),
  } satisfies BackendUser;
});

export async function createUserSession({ userId, userRole }: SessionUser) {
  const sessionId = randomBytes(512).toString('hex');

  const session = await db.createSession({
    id: sessionId,
    userId,
    userRole,
    expirationTime: createSessionExpirationTime(),
  });

  await setSessionCookie(sessionId);
  await setAuthSyncCookie();

  return session;
}

export async function deleteUserSession() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return;
  }

  await db.deleteSession(sessionId);
  await deleteSessionCookie();
  await setAuthSyncCookie();
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
  await setAuthSyncCookie();
}

export async function refreshUserSession(request?: NextRequest) {
  const sessionId = await getSessionCookie(request);

  if (!sessionId) {
    return;
  }

  try {
    await db.updateSession(sessionId, {
      expirationTime: createSessionExpirationTime(),
    });

    await setSessionCookie(sessionId, request);
  } catch (error) {
    console.error('Error refreshing user session:', error);
  }
}

function createSessionExpirationTime() {
  return Date.now() + serverConfig.sessionExpirationInSeconds * 1000;
}
