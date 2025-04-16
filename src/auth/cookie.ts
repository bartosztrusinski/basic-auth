import 'server-only';
import { cookies } from 'next/headers';
import { type NextResponse, type NextRequest } from 'next/server';
import config from './config';
import serverConfig from './config/server';

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

export async function setSessionCookie(sessionId: string, request?: NextRequest) {
  if (request) {
    request.cookies.set({
      name: serverConfig.sessionCookieKey,
      value: sessionId,
      ...serverConfig.sessionCookieAttributes,
    });
    return;
  }

  const cookieStore = await cookies();
  cookieStore.set(serverConfig.sessionCookieKey, sessionId, serverConfig.sessionCookieAttributes);
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

export async function getStateCookie() {
  const cookieStore = await cookies();
  return cookieStore.get(serverConfig.stateCookieKey)?.value;
}

export async function setStateCookie(state: string) {
  const cookieStore = await cookies();
  cookieStore.set(serverConfig.stateCookieKey, state, serverConfig.stateCookieAttributes);
}

export async function deleteStateCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(serverConfig.stateCookieKey);
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
    serverConfig.codeVerifierCookieAttributes,
  );
}

export async function deleteCodeVerifierCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(serverConfig.codeVerifierCookieKey);
}
