import 'server-only';
import { randomBytes, hash } from 'node:crypto';
import { type z } from 'zod';
import { db, type User } from '@/db';
import {
  getStateCookie,
  setStateCookie,
  deleteStateCookie,
  setCodeVerifierCookie,
  getCodeVerifierCookie,
} from '@/auth/cookie';
import { fetcher } from '@/auth/util';
import { AuthError } from '@/auth/message';
import config from '@/auth/config';
import { oAuthTokenSchema } from '@/auth/oauth/schemas';
import { type OAuthUser, type OAuthProvider } from '@/auth/oauth/types';
import providers from '@/auth/oauth/providers';

async function generateAuthorizationUrl(provider: OAuthProvider) {
  const { authorizationUrl, clientId, scope } = providers[provider];
  const responseType = 'code';
  const redirectUrl = getRedirectUrl(provider);
  const state = await generateState();
  const codeVerifier = await generateCodeVerifier();
  const codeChallenge = await generateCodeChallenge(codeVerifier);
  const codeChallengeMethod = 'S256';

  authorizationUrl.searchParams.set('response_type', responseType);
  authorizationUrl.searchParams.set('client_id', clientId);
  authorizationUrl.searchParams.set('scope', scope.join(' '));
  authorizationUrl.searchParams.set('redirect_uri', redirectUrl);
  authorizationUrl.searchParams.set('state', state);
  authorizationUrl.searchParams.set('code_challenge', codeChallenge);
  authorizationUrl.searchParams.set('code_challenge_method', codeChallengeMethod);

  return authorizationUrl;
}

async function fetchOAuthToken(provider: OAuthProvider, code: string) {
  const { tokenUrl, clientId, clientSecret } = providers[provider];
  const grantType = 'authorization_code';
  const redirectUrl = getRedirectUrl(provider);
  const codeVerifier = await getCodeVerifierCookie();

  if (!codeVerifier) {
    throw new Error('Code verifier not found');
  }

  const data = await fetcher(tokenUrl, {
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
      code_verifier: codeVerifier,
    }),
  });

  const { success: isTokenValid, data: tokenData, error } = oAuthTokenSchema.safeParse(data);

  if (!isTokenValid) {
    throw new Error('Invalid token response from provider', error);
  }

  const { token_type, access_token } = tokenData;

  return {
    tokenType: token_type,
    accessToken: access_token,
  };
}

async function fetchOAuthUser(
  provider: OAuthProvider,
  accessToken: string,
  tokenType: string,
): Promise<OAuthUser> {
  const { userUrl, userSchema, userMapper } = providers[provider];
  // TODO type this properly
  // Use type assertion to get the correct type for userMapper
  const typedUserMapper = userMapper as (data: z.infer<typeof userSchema>) => OAuthUser;

  const data = await fetcher(userUrl, {
    headers: {
      Authorization: `${tokenType} ${accessToken}`,
    },
  });

  const { success: isValidUser, data: providerUser, error } = userSchema.safeParse(data);

  if (!isValidUser) {
    throw new Error('Invalid user response from provider', error);
  }

  return typedUserMapper(providerUser);
}

async function createUserAccount(
  provider: OAuthProvider,
  { id, email, ...oAuthData }: OAuthUser,
): Promise<Pick<User, 'id' | 'role'>> {
  const existingUser = await db.getUserByProvider(provider, id);

  if (existingUser) {
    return {
      id: existingUser.id,
      role: existingUser.role,
    };
  }

  const existingUserWithEmail = await db.getUserByEmail(email);

  if (existingUserWithEmail) {
    const accounts = await db.getUserAccounts(existingUserWithEmail.id);
    const isAnotherProviderUsed = accounts.some((account) => account.provider !== provider);

    if (isAnotherProviderUsed || existingUserWithEmail.password) {
      throw new AuthError('oauth-login-email-taken');
    }
  }

  // Start transaction to ensure atomicity when using db
  const newUser = await db.createUser({ email, ...oAuthData });
  await db.createAccount({
    userId: newUser.id,
    provider,
    providerAccountId: id,
  });

  return {
    id: newUser.id,
    role: newUser.role,
  };
}

async function linkUserAccount(
  provider: OAuthProvider,
  accountId: OAuthUser['id'],
  userId: User['id'],
) {
  const existingAccount = await db.getAccountByProvider(provider, accountId);
  const isAccountLinkedToAnotherUser = existingAccount && existingAccount.userId !== userId;

  if (isAccountLinkedToAnotherUser) {
    throw new AuthError('oauth-link-existing-account');
  }

  if (!existingAccount) {
    await db.createAccount({
      userId: userId,
      provider,
      providerAccountId: accountId,
    });
  }
}

async function unlinkUserAccount(provider: OAuthProvider, userId: User['id']) {
  const user = await db.getUserById(userId);

  if (!user) {
    throw new Error('Could not find user');
  }

  const accounts = await db.getUserAccounts(userId);
  const hasOtherAccounts = accounts.some((account) => account.provider !== provider);

  if (!hasOtherAccounts && !user.password) {
    throw new AuthError('oauth-unlink-only-account');
  }

  await db.deleteAccount(userId, provider);
}

function getProviderName(provider: OAuthProvider) {
  return providers[provider].name;
}

function getRedirectUrl(provider: OAuthProvider) {
  return `${config.baseUrl}${config.apiBaseRoute}/${config.apiOAuthEndpoint}/${provider}`;
}

async function validateState(state: string) {
  const storedState = await getStateCookie();

  if (!storedState) {
    return false;
  }

  await deleteStateCookie();

  return state === storedState;
}

async function generateState() {
  const state = randomBytes(64).toString('hex');

  await setStateCookie(state);

  return state;
}

async function generateCodeVerifier() {
  const codeVerifier = randomBytes(64).toString('hex');

  await setCodeVerifierCookie(codeVerifier);

  return codeVerifier;
}

async function generateCodeChallenge(codeVerifier: string) {
  return hash('sha256', codeVerifier, 'base64url');
}

export {
  generateAuthorizationUrl,
  fetchOAuthToken,
  fetchOAuthUser,
  createUserAccount,
  linkUserAccount,
  unlinkUserAccount,
  getProviderName,
  getRedirectUrl,
  validateState,
};
