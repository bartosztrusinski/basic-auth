import 'server-only';
import { NextResponse, type NextRequest } from 'next/server';
import { redirect } from 'next/navigation';
import { env } from '@/env';
import { db, type OAuthProvider } from '@/db';
import { discordUserSchema, tokenSchema } from '@/schemas';
import { auth, createUserSession, currentUser } from './session';
import { fetcher, redirectToLogin } from './util';
import config from './config';
import serverConfig from './config/server';

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
    await getOAuthUser(provider, request);
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

  try {
    if (!code) {
      throw new Error('Missing code');
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

async function connectUserToAccount(
  { id, email, name }: { id: string; email: string; name: string },
  provider: OAuthProvider,
) {
  // Start transaction to ensure atomicity when using db
  const existingUser = await db.getUserByEmail(email);
  const user = existingUser ?? (await db.createUser({ email, name }));

  // Do nothing on conflict
  await db.createAccount({
    userId: user.id,
    provider,
    providerAccountId: id,
  });

  return user;
}

async function fetchOAuthToken(code: string, provider: OAuthProvider) {
  const grantType = 'authorization_code';
  const redirectUrl = `${env.BASE_URL}${config.apiBaseRoute}/${config.apiOAuthEndpoint}/${provider}`;
  const clientId = env.DISCORD_CLIENT_ID;
  const clientSecret = env.DISCORD_CLIENT_SECRET;

  const rawData = await fetcher('https://discord.com/api/oauth2/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      Accept: 'application/json',
    },
    body: new URLSearchParams({
      grant_type: grantType,
      code,
      redirect_uri: redirectUrl,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const { success, data } = tokenSchema.safeParse(rawData);

  if (!success) {
    throw new Error('Invalid token response');
  }

  const { token_type, access_token } = data;

  return {
    tokenType: token_type,
    accessToken: access_token,
  };
}

async function fetchOAuthUser(accessToken: string, tokenType: string) {
  const rawData = await fetcher('https://discord.com/api/users/@me', {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  const { success, data } = discordUserSchema.safeParse(rawData);

  if (!success) {
    throw new Error('Invalid user response');
  }

  const { id, email, global_name, username } = data;

  return {
    id,
    email,
    name: global_name ?? username,
  };
}

export const handlers = {
  GET,
};
