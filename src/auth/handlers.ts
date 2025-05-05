import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { auth, createUserSession, currentUser } from '@/auth/session';
import { redirectAuth, redirectToLogin } from '@/auth/util';
import { deleteSessionCookie } from '@/auth/cookie';
import { AuthError } from '@/auth/message';
import { signUpWithProvider, exchangeCodeForOAuthUser, createProviderAccount } from '@/auth/oauth';
import config from '@/auth/config';

export const handlers = { GET };

async function GET(request: NextRequest, { params }: { params: Promise<{ endpoint: string[] }> }) {
  const { endpoint } = await params;
  const [resource, provider] = endpoint;

  if (resource === config.apiSessionEndpoint) {
    return getSession();
  }

  if (resource === config.apiUserEndpoint) {
    return getCurrentUser();
  }

  if (resource === config.apiOAuthEndpoint) {
    await handleOAuthCallback(provider, request);
  }

  return NextResponse.json({ error: 'Invalid endpoint' }, { status: 404 });
}

async function getSession(): Promise<NextResponse> {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  if (!isLoggedIn) {
    await deleteSessionCookie();
  }

  return NextResponse.json({
    isLoggedIn,
    userId,
    userRole,
    expirationTime,
  });
}

async function getCurrentUser(): Promise<NextResponse> {
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

async function handleOAuthCallback(rawProvider: string | undefined, request: NextRequest) {
  const { userId } = await auth();
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');

  if (userId) {
    await handleOAuthAccountLink(rawProvider, code, state);
  } else {
    await handleOAuthSignup(rawProvider, code, state);
  }
}

async function handleOAuthAccountLink(
  rawProvider: string | undefined,
  code: string | null,
  state: string | null,
): Promise<void> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new Error('User not logged in');
    }

    const { provider, oAuthUser } = await exchangeCodeForOAuthUser(rawProvider, code, state);
    await createProviderAccount(provider, oAuthUser.id, userId);
  } catch (error) {
    redirectAuth(config.oAuthRedirectRoute, {
      authCode: error instanceof AuthError ? error.authCode : 'oauth-link-failed',
    });
  }

  redirectAuth(config.oAuthRedirectRoute, { authCode: 'oauth-link' });
}

async function handleOAuthSignup(
  rawProvider: string | undefined,
  code: string | null,
  state: string | null,
): Promise<void> {
  try {
    const { provider, oAuthUser } = await exchangeCodeForOAuthUser(rawProvider, code, state);
    const user = await signUpWithProvider(provider, oAuthUser);
    await createUserSession({
      userId: user.id,
      userRole: user.role,
    });
  } catch (error) {
    redirectToLogin({
      authCode: error instanceof AuthError ? error.authCode : 'oauth-login-failed',
    });
  }

  redirect(config.defaultRedirectRoute);
}
