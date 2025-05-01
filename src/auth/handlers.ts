import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { auth, createUserSession, currentUser } from './session';
import { redirectAuth, redirectToLogin } from './util';
import { deleteSessionCookie } from './cookie';
import { AuthError } from './message';
import {
  createUserAccount,
  fetchOAuthToken,
  fetchOAuthUser,
  linkUserAccount,
  validateState,
} from './oauth';
import { OAuthProviderEnum } from './oauth/providers';
import config from './config';

export const handlers = { GET };

async function GET(request: NextRequest, { params }: { params: Promise<{ endpoint: string[] }> }) {
  const { endpoint } = await params;
  const [resource, provider] = endpoint;

  if (resource === config.apiSessionEndpoint) {
    return await getSession();
  }

  if (resource === config.apiUserEndpoint) {
    return await getCurrentUser();
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
          hasPassword: backendUser.hasPassword,
        }
      : null,
  );
}

// TODO big function, split and make it do one thing
async function handleOAuthCallback(
  providerParam: string | undefined,
  request: NextRequest,
): Promise<void> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const { success: isValidProvider, data: provider } = OAuthProviderEnum.safeParse(providerParam);
  const { userId } = await auth();

  try {
    if (!isValidProvider) {
      throw new Error('Invalid provider');
    }

    if (!code) {
      throw new Error('Missing code');
    }

    if (!state) {
      throw new Error('Missing state');
    }

    const isValidState = await validateState(state);

    if (!isValidState) {
      throw new Error('Invalid state');
    }

    const { tokenType, accessToken } = await fetchOAuthToken(provider, code);
    const oAuthUser = await fetchOAuthUser(provider, accessToken, tokenType);

    if (userId) {
      await linkUserAccount(provider, oAuthUser.id, userId);
    } else {
      const user = await createUserAccount(provider, oAuthUser);
      await createUserSession({
        userId: user.id,
        userRole: user.role,
      });
    }
  } catch (error) {
    const authCode = error instanceof AuthError ? error.authCode : null;

    console.error('OAuth callback error:', error);

    if (userId) {
      redirectAuth(config.oAuthRedirectRoute, {
        authCode: authCode ?? 'oauth-link-failed',
      });
    }

    redirectToLogin({
      authCode: authCode ?? 'oauth-login-failed',
    });
  }

  if (userId) {
    redirectAuth(config.oAuthRedirectRoute, { authCode: 'oauth-link' });
  }

  redirect(config.defaultRedirectRoute);
}
