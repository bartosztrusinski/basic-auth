import 'server-only';
import { cookies } from 'next/headers';
import { type NextResponse, type NextRequest } from 'next/server';
import { type StateData } from '@/auth/oauth';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

export async function getSessionCookie(request?: NextRequest) {
  if (request) {
    return request.cookies.get(serverConfig.sessionCookieKey)?.value;
  }

  const cookieStore = await cookies();
  return cookieStore.get(serverConfig.sessionCookieKey)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(serverConfig.sessionCookieKey);
}

export async function setSessionCookie(sessionToken: string, request?: NextRequest) {
  if (request) {
    request.cookies.set({
      name: serverConfig.sessionCookieKey,
      value: sessionToken,
      ...serverConfig.sessionCookieAttributes,
    });
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(
    serverConfig.sessionCookieKey,
    sessionToken,
    serverConfig.sessionCookieAttributes,
  );
}

export async function setAuthSyncCookie(response?: NextResponse) {
  const value = String(true);
  const attributes = {
    maxAge: 5,
    path: '/',
  };

  if (response) {
    response.cookies.set({ name: config.syncAuthCookieKey, value, ...attributes });
  }

  const cookieStore = await cookies();
  cookieStore.set(config.syncAuthCookieKey, value, attributes);
}

export async function getStateCookie(state: string): Promise<StateData | null> {
  const cookieStore = await cookies();
  const stringifiedData = cookieStore.get(state)?.value;

  if (!stringifiedData) {
    return null;
  }

  try {
    return JSON.parse(stringifiedData) as StateData;
  } catch {
    return null;
  }
}

export async function setStateCookie(state: string, data: StateData = {}) {
  const cookieStore = await cookies();
  cookieStore.set(state, JSON.stringify(data), serverConfig.oAuthCookieAttributes);
}

export async function deleteStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.delete(state);
}

export async function getCodeVerifierCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(serverConfig.codeVerifierCookieKey)?.value;
}

export async function setCodeVerifierCookie(codeVerifier: string) {
  const cookieStore = await cookies();
  cookieStore.set(
    serverConfig.codeVerifierCookieKey,
    codeVerifier,
    serverConfig.oAuthCookieAttributes,
  );
}

export async function deleteCodeVerifierCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(serverConfig.codeVerifierCookieKey);
}
