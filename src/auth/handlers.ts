import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { auth, createUserSession, currentUser } from './session';
import { redirectToLogin } from './util';
import { deleteSessionCookie } from './cookie';
import config from './config';
import {
  createUserAccount,
  fetchOAuthToken,
  fetchOAuthUser,
  getProviderName,
  linkUserAccount,
  validateState,
} from './oauth';
import { OAuthProviderEnum } from './oauth/providers';
import oAuthConfig from './oauth/config';
import { verifyEmail } from './email';

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

  if (resource === 'verify-email') {
    const token = request.nextUrl.searchParams.get('token');

    if (!token) {
      redirect(
        `/resend-verification?redirect_reason=${encodeURIComponent('Missing verification token')}`,
      );
    }

    await verifyEmail(token);
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

// TODO big function, split and make it do one thing
async function handleOAuthCallback(
  providerParam: string | undefined,
  request: NextRequest,
): Promise<void> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const { success: isValidProvider, data: provider } = OAuthProviderEnum.safeParse(providerParam);
  const { userId } = await auth();
  const isLoggedIn = Boolean(userId);

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

    if (isLoggedIn) {
      await linkUserAccount(provider, oAuthUser);
    } else {
      const user = await createUserAccount(provider, oAuthUser);
      await createUserSession({
        userId: user.id,
        userRole: user.role,
      });
    }
  } catch (error) {
    // TODO handle error properly
    console.error(error);

    const providerName = provider ? getProviderName(provider) : null;
    const errorCause =
      error instanceof Error && typeof error.cause === 'string' ? error.cause : null;

    if (isLoggedIn) {
      redirect(
        `${oAuthConfig.redirectRoute}?${oAuthConfig.accountLinkErrorKey}=${errorCause ?? `Could not link your ${providerName ?? ''} account. Please try again.`}`,
      );
    }

    redirectToLogin({
      redirectReason:
        errorCause ?? `Could not log in with ${providerName ?? 'your provider'}. Please try again.`,
    });
  }

  redirect(userId ? oAuthConfig.redirectRoute : config.defaultRedirectRoute);
}
