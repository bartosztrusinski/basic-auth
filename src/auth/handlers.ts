import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { auth, createUserSession, currentUser } from './session';
import { redirectToLogin } from './util';
import { deleteSessionCookie } from './cookie';
import { connectUserToAccount, fetchOAuthToken, fetchOAuthUser, validateState } from './oauth';
import { OAuthProviderEnum } from './schemas';
import config from './config';

export const handlers = { GET };

async function GET(request: NextRequest, { params }: { params: Promise<{ endpoint: string[] }> }) {
  const { endpoint } = await params;
  const [resource, providerParam] = endpoint;

  if (resource === config.apiSessionEndpoint) {
    return await getSession();
  }

  if (resource === config.apiUserEndpoint) {
    return await getCurrentUser();
  }

  if (resource === config.apiOAuthEndpoint) {
    await handleOAuthCallback(providerParam, request);
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
  const { success, data: provider } = OAuthProviderEnum.safeParse(providerParam);

  try {
    if (!success) {
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

    const { tokenType, accessToken } = await fetchOAuthToken(code, provider);
    const oAuthUser = await fetchOAuthUser(accessToken, tokenType);
    const user = await connectUserToAccount(oAuthUser, provider);
    await createUserSession({
      userId: user.id,
      userRole: user.role,
    });
  } catch (error) {
    console.error(error);
    // TODO error in search params
    redirectToLogin();
  }

  redirect(config.defaultRedirectRoute);
}
