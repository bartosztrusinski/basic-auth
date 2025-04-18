import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { auth, createUserSession, currentUser } from './session';
import { redirectToLogin } from './util';
import { deleteSessionCookie } from './cookie';
import config from './config';
import { connectUserToAccount, fetchOAuthToken, fetchOAuthUser, validateState } from './oauth';
import { OAuthProviderEnum } from './oauth/providers';

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
        }
      : null,
  );
}

async function handleOAuthCallback(
  providerParam: string | undefined,
  request: NextRequest,
): Promise<void> {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const { success: isValidProvider, data: provider } = OAuthProviderEnum.safeParse(providerParam);

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
    const user = await connectUserToAccount(provider, oAuthUser);
    await createUserSession({
      userId: user.id,
      userRole: user.role,
    });
  } catch (error) {
    console.error(error);
    redirectToLogin({ redirectReason: 'Could not log in with your provider. Please try again.' });
  }

  redirect(config.defaultRedirectRoute);
}
