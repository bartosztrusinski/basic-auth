import 'server-only';
import { cache } from 'react';
import { RedirectType } from 'next/navigation';
import { type NextRequest } from 'next/server';
import { getUserById, type User } from '@/db/user';
import {
  createSession,
  deleteSession,
  deleteUserSessions,
  getSessionById,
  refreshSession,
  type Session,
} from '@/db/session';
import { redirectAuth, type FullOrNull, type Null, type RedirectOptions } from '@/auth/util';
import {
  getSessionCookie,
  setSessionCookie,
  deleteSessionCookie,
  setAuthSyncCookie,
} from '@/auth/cookie';
import { generateRandomString } from '@/auth/crypto';
import config from '@/auth/config';

export type BackendSession = Omit<Session, 'id'> & {
  userRole: User['role'];
};

export type Auth =
  | ({
      isLoggedIn: true;
    } & BackendSession)
  | ({
      isLoggedIn: false;
    } & Null<BackendSession>);

export type BackendUser = Pick<User, 'id' | 'email' | 'name' | 'role'> & {
  hasPassword: boolean;
  isTwoFactorEnabled: boolean;
};

export type CurrentUser = Pick<BackendUser, 'id' | 'email' | 'name'>;

interface AuthUtil {
  (): Promise<FullOrNull<BackendSession>>;
  protect: (options?: ProtectOptions) => Promise<Pick<BackendSession, 'userId'>>;
}

type ProtectOptions = {
  role?: User['role'];
  unauthorizedUrl?: string;
  unauthenticatedUrl?: string;
} & Omit<RedirectOptions, 'type'>;

export type RedirectToLoginOptions = Omit<RedirectOptions, 'type'> & {
  syncAuth?: boolean;
};

export const auth: AuthUtil = Object.assign(cache(authFn), { protect });

async function authFn(): Promise<FullOrNull<BackendSession>> {
  const sessionId = await getSessionCookie();
  const auth: Null<BackendSession> = {
    userId: null,
    userRole: null,
    expiresAt: null,
  };

  if (!sessionId) {
    return auth;
  }

  const session = await getSessionById(sessionId);

  if (!session) {
    return auth;
  }

  const { userId, userRole, expiresAt } = session;

  return {
    userId,
    userRole,
    expiresAt,
  };
}

async function protect({
  role,
  unauthorizedUrl,
  unauthenticatedUrl,
  ...redirectParams
}: ProtectOptions = {}) {
  const { userId, userRole } = await auth();

  if (!userId) {
    setAuthSyncCookie().catch(() => null);

    if (unauthenticatedUrl) {
      redirectAuth(unauthenticatedUrl, {
        type: RedirectType.replace,
        authCode: 'unauthenticated',
      });
    }

    redirectToLogin(redirectParams);
  }

  if (role && userRole !== role) {
    setAuthSyncCookie().catch(() => null);

    redirectAuth(unauthorizedUrl ?? config.defaultRedirectRoute, {
      type: RedirectType.replace,
      authCode: 'unauthorized',
    });
  }

  return { userId };
}

export function redirectToLogin({
  authCode = 'unauthenticated',
  syncAuth = false,
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

  const user = await getUserById(userId);

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    hasPassword: Boolean(user.password),
    isTwoFactorEnabled: Boolean(user.twoFactorSecret),
  } satisfies BackendUser;
});

export async function createUserSession(userId: BackendSession['userId']): Promise<Session> {
  const sessionId = generateRandomString(32);
  const session = await createSession({ id: sessionId, userId });

  await setSessionCookie(sessionId);
  await setAuthSyncCookie();

  return session;
}

export async function deleteUserSession() {
  const sessionId = await getSessionCookie();

  if (!sessionId) {
    return;
  }

  await deleteSession(sessionId);
  await deleteSessionCookie();
  await setAuthSyncCookie();
}

export async function deleteAllUserSessions(userId: User['id']) {
  await deleteUserSessions(userId);
  await deleteSessionCookie();
  await setAuthSyncCookie();
}

export async function refreshUserSession(request?: NextRequest) {
  const sessionId = await getSessionCookie(request);

  if (!sessionId) {
    return;
  }

  await refreshSession(sessionId);
  await setSessionCookie(sessionId, request);
  await setAuthSyncCookie();
}
