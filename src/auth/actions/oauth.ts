import { redirect } from 'next/navigation';
import {
  type OAuthProvider,
  type StateData,
  generateAuthorizationUrl,
  deleteProviderAccount,
} from '@/auth/oauth';
import { auth } from '@/auth/session';
import { AuthError } from '@/auth/message';
import { handleError } from './util';
import { type ActionState } from './types';

export async function logInWithProvider(
  provider: OAuthProvider,
  stateData: StateData = {},
): Promise<ActionState> {
  let authorizationUrl: URL;

  try {
    authorizationUrl = await generateAuthorizationUrl(provider, stateData);
  } catch (error) {
    return handleError(error, 'oauth-login-failed');
  }

  redirect(authorizationUrl.toString());
}

export async function linkAccount(
  provider: OAuthProvider,
  stateData: StateData = {},
): Promise<ActionState> {
  let authorizationUrl: URL;
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    authorizationUrl = await generateAuthorizationUrl(provider, stateData);
  } catch (error) {
    return handleError(error, 'oauth-link-failed');
  }

  redirect(authorizationUrl.toString());
}

export async function unlinkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteProviderAccount(provider, userId);

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'oauth-unlink-failed');
  }
}
