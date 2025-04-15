import 'server-only';
import { randomBytes } from 'node:crypto';
import { type z } from 'zod';
import { env } from '@/env';
import { db, type User } from '@/db';
import { oAuthTokenSchema, discordUserSchema, type OAuthProviderEnum } from './schemas';
import { getStateCookie, setStateCookie, deleteStateCookie } from './cookie';
import { fetcher } from './util';
import config from './config';

export type OAuthProvider = z.infer<typeof OAuthProviderEnum>;
export type OAuthUser = {
  id: string;
  email: User['email'];
  name: User['name'];
};

export async function generateState() {
  const state = randomBytes(64).toString('hex');

  await setStateCookie(state);

  return state;
}

export async function validateState(state: string) {
  const storedState = await getStateCookie();

  if (!storedState) {
    return false;
  }

  await deleteStateCookie();

  return state === storedState;
}

export async function fetchOAuthToken(code: string, provider: OAuthProvider) {
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

  const { success, data } = oAuthTokenSchema.safeParse(rawData);

  if (!success) {
    throw new Error('Invalid token response');
  }

  const { token_type, access_token } = data;

  return {
    tokenType: token_type,
    accessToken: access_token,
  };
}

export async function fetchOAuthUser(accessToken: string, tokenType: string): Promise<OAuthUser> {
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

export async function connectUserToAccount(
  { id, email, name }: OAuthUser,
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
