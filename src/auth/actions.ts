'use server';

import { redirect } from 'next/navigation';
import { db, type VerificationToken, type Session } from '@/db';
// TODO move to auth
import { loginSchema, resendVerificationEmailSchema } from '@/schemas';
import { auth, createUserSession, deleteUserSession } from './session';
import { comparePasswords } from './password';
import { redirectAuth, redirectToLogin } from './util';
import { generateAuthorizationUrl, unlinkUserAccount } from './oauth';
import { type OAuthProvider } from './oauth/types';
import { sendVerificationEmail } from './email';
import { createEmailVerificationToken } from './verification-token';
import { type AuthCode, AuthError, getAuthMessage } from './message';
import config from './config';

type ActionState = {
  isSuccess: boolean;
  errors?: string[];
};

export async function logIn(
  _: unknown,
  formData: FormData,
): Promise<ActionState & { session?: Session }> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, password } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user?.password || !user?.salt) {
      return {
        isSuccess: false,
        errors: [getAuthMessage('invalid-credentials').message],
      };
    }

    const isCorrectPassword = await comparePasswords(password, user.password, user.salt);

    if (!isCorrectPassword || !user.emailVerified) {
      return {
        isSuccess: false,
        errors: [getAuthMessage('invalid-credentials').message],
      };
    }

    const session = await createUserSession({ userId: user.id, userRole: user.role });

    return {
      isSuccess: true,
      session,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'An error occurred while logging in. Please try again.',
      ],
    };
  }
}

export async function logOut(): Promise<ActionState> {
  await deleteUserSession();
  redirectToLogin({ authCode: null });
}

export async function logInWithProvider(provider: OAuthProvider): Promise<ActionState> {
  return initializeOAuth(provider, 'oauth-login-failed');
}

export async function linkAccount(provider: OAuthProvider): Promise<ActionState> {
  return initializeOAuth(provider, 'oauth-link-failed');
}

async function initializeOAuth(
  provider: OAuthProvider,
  defaultAuthCode: AuthCode,
): Promise<ActionState> {
  let authorizationUrl: URL;

  try {
    authorizationUrl = await generateAuthorizationUrl(provider);
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        getAuthMessage(error instanceof AuthError ? error.authCode : defaultAuthCode).message,
      ],
    };
  }

  redirect(authorizationUrl.toString());
}

export async function unlinkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { userId } = await auth.protect();

  try {
    await unlinkUserAccount(provider, userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        getAuthMessage(error instanceof AuthError ? error.authCode : 'oauth-unlink-failed').message,
      ],
    };
  }
}

export async function verifyEmail(token: VerificationToken['token']): Promise<ActionState> {
  try {
    const verificationToken = await db.getVerificationTokenByToken(token);

    if (!verificationToken || verificationToken.expirationTime < Date.now()) {
      throw new AuthError('email-verification-expired');
    }

    const { email } = verificationToken;
    const user = await db.getUserByEmail(email);

    if (!user) {
      throw new Error('Email does not exist');
    }

    if (!user.emailVerified) {
      await db.updateUser(user.id, { emailVerified: Date.now() });
    }

    await db.deleteVerificationToken(verificationToken.email);
  } catch (error) {
    redirectAuth(config.resendVerificationEmailRoute, {
      authCode: error instanceof AuthError ? error.authCode : 'email-verification-failed',
    });
  }

  redirectToLogin({ authCode: 'email-verified' });
}

export async function resendVerificationEmail(
  _: unknown,
  formData: FormData,
): Promise<ActionState> {
  const { data, error } = resendVerificationEmailSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user) {
      return {
        isSuccess: true,
      };
    }

    if (user.emailVerified) {
      return {
        isSuccess: true,
      };
    }

    const verificationToken = await createEmailVerificationToken(user.email);
    await sendVerificationEmail(verificationToken.email, verificationToken.token, user.name);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        getAuthMessage(error instanceof AuthError ? error.authCode : 'verification-email-not-sent')
          .message,
      ],
    };
  }
}
