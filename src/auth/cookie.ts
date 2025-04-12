import { cookies } from 'next/headers';
import { type NextResponse, type NextRequest } from 'next/server';
import config from './config';

export async function getSessionCookie(request?: NextRequest) {
  if (request) {
    return request.cookies.get(config.sessionCookieKey)?.value;
  }

  const cookieStore = await cookies();
  return cookieStore.get(config.sessionCookieKey)?.value;
}

export async function deleteSessionCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(config.sessionCookieKey);
  await setAuthSyncCookie();
}

export async function setSessionCookie(
  sessionId: string,
  request?: NextRequest,
  response?: NextResponse,
) {
  if (request) {
    request.cookies.set({
      name: config.sessionCookieKey,
      value: sessionId,
      ...config.sessionCookieAttributes,
    });
    return;
  }

  await setAuthSyncCookie(response);

  const cookieStore = await cookies();
  cookieStore.set(config.sessionCookieKey, sessionId, config.sessionCookieAttributes);
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
