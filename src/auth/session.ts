import 'server-only';
import { randomBytes } from 'node:crypto';
import { cache } from 'react';
import { RedirectType } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { db, type Session, type User } from '@/db';
import { redirectAuth, type RedirectOptions } from '@/auth/util';
import {
  getSessionCookie,
  setSessionCookie,
  deleteSessionCookie,
  setAuthSyncCookie,
} from '@/auth/cookie';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

type BackendSession = Pick<Session, 'userId' | 'userRole' | 'expirationTime'>;

export type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role' | 'isTwoFactorEnabled'> & {
  hasPassword: boolean;
};

type NullBackendSession = Record<keyof BackendSession, null>;

interface Auth {
  (): Promise<BackendSession | NullBackendSession>;
  protect: (options?: ProtectOptions) => Promise<Pick<BackendSession, 'userId'>>;
}

type ProtectOptions = {
  role?: User['role'];
  unauthorizedUrl?: string;
  unauthenticatedUrl?: string;
} & RedirectToLoginOptions;

export type RedirectToLoginOptions = Omit<RedirectOptions, 'type'> & {
  syncAuth?: boolean;
};

export const auth: Auth = Object.assign(cache(authFn), { protect });

async function authFn(): Promise<BackendSession | NullBackendSession> {
  const sessionId = await getSessionCookie();
  const auth: NullBackendSession = {
    userId: null,
    userRole: null,
    expirationTime: null,
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
    userId,
    userRole,
    expirationTime,
  };
}

async function protect({
  role,
  unauthorizedUrl,
  unauthenticatedUrl,
  ...redirectParams
}: ProtectOptions = {}) {
  const { userId, userRole } = await auth();

  setAuthSyncCookie().catch(() => null);

  if (!userId) {
    if (unauthenticatedUrl) {
      redirectAuth(unauthenticatedUrl, {
        type: RedirectType.replace,
        authCode: 'unauthenticated',
      });
    }

    redirectToLogin({ ...redirectParams, syncAuth: false });
  }

  if (role && userRole !== role) {
    redirectAuth(unauthorizedUrl ?? config.defaultRedirectRoute, {
      type: RedirectType.replace,
      authCode: 'unauthorized',
    });
  }

  return { userId };
}

export function redirectToLogin({
  syncAuth = true,
  authCode = 'unauthenticated',
  returnBackUrl,
}: RedirectToLoginOptions = {}): never {
  if (syncAuth) {
    setAuthSyncCookie().catch(() => null);
  }

  const redirectUrl = new URL(config.loginRoute, config.baseUrl);

  if (returnBackUrl) {
    redirectUrl.searchParams.set(config.returnBackUrlKey, returnBackUrl);
  }

  redirectAuth(redirectUrl.toString(), { type: RedirectType.replace, authCode });
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
    isTwoFactorEnabled: user.isTwoFactorEnabled,
  } satisfies BackendUser;
});

export async function createUserSession({
  userId,
  userRole,
}: Omit<BackendSession, 'expirationTime'>) {
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

export async function deleteAllUserSessions(userId: User['id']) {
  await db.deleteUserSessions(userId);
  await deleteSessionCookie();
  await setAuthSyncCookie();
}

export async function updateUserSession({
  userId,
  userRole,
}: Omit<BackendSession, 'expirationTime'>) {
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
