import 'server-only';
import { randomBytes, hash } from 'node:crypto';
import { type z } from 'zod';
import { db, type User } from '@/db';
import { env } from '@/env';
import {
  getStateCookie,
  setStateCookie,
  deleteStateCookie,
  setCodeVerifierCookie,
  getCodeVerifierCookie,
} from '../cookie';
import { currentUser } from '../session';
import { fetcher } from '../util';
import config from '../config';
import { oAuthTokenSchema } from './schemas';
import { type OAuthUser, type OAuthProvider } from './types';
import providers from './providers';

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
    console.error(error);
    throw new Error('Invalid token response from provider');
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
    console.error(error);
    throw new Error('Invalid user response from provider');
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
  const providerName = getProviderName(provider);

  if (existingUserWithEmail) {
    const accounts = await db.getUserAccounts(existingUserWithEmail.id);
    const otherUserProvider = accounts
      .map((account) => account.provider)
      .find((p) => p !== provider);

    if (otherUserProvider) {
      throw new Error('User already registered with given email address', {
        cause: `This email is already registered with another provider.
        Please try to log in using ${getProviderName(otherUserProvider)}.
        You can link your ${providerName} account after logging in.`,
      });
    }

    if (existingUserWithEmail.password) {
      throw new Error('User already registered with given email address', {
        cause: `This email is already registered with another provider.
        Please try to log in using password.
        You can link your ${providerName} account after logging in.`,
      });
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

async function linkUserAccount(provider: OAuthProvider, { id, email }: OAuthUser) {
  const user = await currentUser();

  if (!user) {
    throw new Error('User not logged in');
  }

  const isCurrentUser = (userId: User['id']) => user.id === userId;
  const existingAccount = await db.getAccountByProvider(provider, id);
  const providerName = getProviderName(provider);

  if (existingAccount) {
    if (isCurrentUser(existingAccount.userId)) return;

    throw new Error('This account is already in use', {
      cause: `This ${providerName} account is already linked to another user.`,
    });
  }

  const existingUserWithEmail = await db.getUserByEmail(email);

  if (existingUserWithEmail && !isCurrentUser(existingUserWithEmail.id)) {
    throw new Error('Providers email is already used by another user', {
      cause: `Email of this ${providerName} account is already linked to another user.`,
    });
  }

  await db.createAccount({
    userId: user.id,
    provider,
    providerAccountId: id,
  });
}

async function unlinkUserAccount(provider: OAuthProvider, userId: User['id']) {
  await db.deleteAccount(userId, provider);
}

function getProviderName(provider: OAuthProvider) {
  return providers[provider].name;
}

function getRedirectUrl(provider: OAuthProvider) {
  return `${env.BASE_URL}${config.apiBaseRoute}/${config.apiOAuthEndpoint}/${provider}`;
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
