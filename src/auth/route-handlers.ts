import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { createAccount } from '@/data/account';
import { auth, redirectToLogin, currentUser, type CurrentUser, type Auth } from '@/auth/session';
import { redirectAuth } from '@/auth/util';
import { deleteSessionCookie } from '@/auth/cookie';
import { AuthError } from '@/auth/message';
import { signUpWithProvider, exchangeCodeForOAuthUser } from '@/auth/oauth';
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
  const { userId, userRole, expiresAt } = await auth();

  if (!userId) {
    await deleteSessionCookie();
  }

  return NextResponse.json<Auth>(
    userId
      ? { isLoggedIn: true, userId, userRole, expiresAt }
      : { isLoggedIn: false, userId: null, userRole: null, expiresAt: null },
  );
}

async function getCurrentUser(): Promise<NextResponse> {
  const backendUser = await currentUser();

  return NextResponse.json<CurrentUser | null>(
    backendUser ? { id: backendUser.id, email: backendUser.email, name: backendUser.name } : null,
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
  let redirectUrl: string = config.defaultRedirectRoute;

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    const { provider, oAuthUser, stateData } = await exchangeCodeForOAuthUser(
      rawProvider,
      code,
      state,
    );

    if (stateData.redirectUrl) {
      redirectUrl = stateData.redirectUrl;
    }

    const wasAccountCreated = await createAccount({
      userId,
      provider,
      providerAccountId: oAuthUser.id,
    });

    if (!wasAccountCreated) {
      throw new AuthError('oauth-link-existing-account');
    }
  } catch (error) {
    redirectAuth(redirectUrl, {
      authCode: error instanceof AuthError ? error.authCode : 'oauth-link-failed',
    });
  }

  redirectAuth(redirectUrl, { authCode: 'oauth-link' });
}

async function handleOAuthSignup(
  rawProvider: string | undefined,
  code: string | null,
  state: string | null,
): Promise<void> {
  let redirectUrl: string = config.defaultRedirectRoute;

  try {
    const { provider, oAuthUser, stateData } = await exchangeCodeForOAuthUser(
      rawProvider,
      code,
      state,
    );

    if (stateData.redirectUrl) {
      redirectUrl = stateData.redirectUrl;
    }

    await signUpWithProvider(provider, oAuthUser);
  } catch (error) {
    redirectToLogin({
      authCode: error instanceof AuthError ? error.authCode : 'oauth-login-failed',
    });
  }

  redirect(redirectUrl);
}
