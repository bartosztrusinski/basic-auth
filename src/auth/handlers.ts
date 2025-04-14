import { NextResponse } from 'next/server';
import { auth, currentUser } from './session';
import config from './config';

async function GET(_: Request, { params }: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await params;

  if (endpoint === config.apiSessionEndpoint) {
    return getSession();
  }

  if (endpoint === config.apiUserEndpoint) {
    return getCurrentUser();
  }
}

async function getSession() {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  if (!isLoggedIn) {
    const response = NextResponse.json({
      isLoggedIn: false,
    });

    response.cookies.delete(config.sessionCookieKey);

    return response;
  }

  return NextResponse.json({
    isLoggedIn,
    userId,
    userRole,
    expirationTime,
  });
}

async function getCurrentUser() {
  const backendUser = await currentUser();

  return NextResponse.json(
    backendUser
      ? {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
        }
      : null,
  );
}

export const handlers = {
  GET,
};
