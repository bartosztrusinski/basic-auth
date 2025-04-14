import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { auth, currentUser } from './session';
import config from './config';
import serverConfig from './config/server';
import { type OAuthProvider } from '@/db';

async function GET(request: NextRequest, { params }: { params: Promise<{ endpoint: string[] }> }) {
  const { endpoint } = await params;
  const [first, second] = endpoint;

  if (first === config.apiSessionEndpoint) {
    return getSession();
  }

  if (first === config.apiUserEndpoint) {
    return getCurrentUser();
  }

  if (first === config.apiOAuthEndpoint) {
    const provider = second as OAuthProvider;
    return getOAuthUser(provider, request);
  }
}

async function getSession() {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  if (!isLoggedIn) {
    const response = NextResponse.json({
      isLoggedIn: false,
    });

    response.cookies.delete(serverConfig.sessionCookieKey);

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

async function getOAuthUser(provider: OAuthProvider, request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  console.log('getOAuthUser', provider, code);

  return NextResponse.json({
    provider,
    code,
  });
}

export const handlers = {
  GET,
};
