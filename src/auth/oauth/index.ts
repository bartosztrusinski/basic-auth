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
import { oAuthTokenSchema } from '@/auth/oauth/schemas';
import { type OAuthUser, type OAuthProvider } from '@/auth/oauth/types';
import config from '@/auth/config';
import providers, { OAuthProviderEnum } from '@/auth/oauth/providers';

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

async function exchangeCodeForOAuthUser(
  rawProvider: string | undefined,
  code: string | null,
  state: string | null,
) {
  const { success: isValidProvider, data: provider } = OAuthProviderEnum.safeParse(rawProvider);

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

  return { oAuthUser, provider };
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
  // Uses type assertion to get the correct type for userMapper
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

async function signUpWithProvider(
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

  const existingEmailUser = await db.getUserByEmail(email);

  if (existingEmailUser?.emailVerified) {
    throw new AuthError('oauth-login-email-taken');
  }

  if (existingEmailUser) {
    await db.updateUser(existingEmailUser.id, { emailVerified: Date.now() });
  }

  const user =
    existingEmailUser ?? (await db.createUser({ email, ...oAuthData, emailVerified: Date.now() }));

  await db.createAccount({
    userId: user.id,
    provider,
    providerAccountId: id,
  });

  return {
    id: user.id,
    role: user.role,
  };
}

async function createProviderAccount(
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

async function deleteProviderAccount(provider: OAuthProvider, userId: User['id']) {
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
  exchangeCodeForOAuthUser,
  signUpWithProvider,
  createProviderAccount,
  deleteProviderAccount,
  getProviderName,
  getRedirectUrl,
};
