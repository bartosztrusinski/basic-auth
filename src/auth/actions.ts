'use server';

import { redirect } from 'next/navigation';
import { db, type VerificationToken, type Session } from '@/db';
// TODO move to auth
import { loginSchema, resendVerificationEmailSchema } from '@/schemas';
import { auth, createUserSession, deleteUserSession } from './session';
import { comparePasswords } from './password';
import { redirectToLogin } from './util';
import { generateAuthorizationUrl, unlinkUserAccount } from './oauth';
import { type OAuthProvider } from './oauth/types';
import { sendVerificationEmail } from './email';
import { createEmailVerificationToken } from './verification-token';
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
        errors: ['Invalid email or password'],
      };
    }

    const isCorrectPassword = await comparePasswords(password, user.password, user.salt);

    if (!isCorrectPassword) {
      return {
        isSuccess: false,
        errors: ['Invalid email or password'],
      };
    }

    if (!user.emailVerified) {
      const verificationToken = await createEmailVerificationToken(user.email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, user.name);

      return {
        isSuccess: true,
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
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }
}

export async function logInWithProvider(provider: OAuthProvider) {
  const authorizationUrl = await generateAuthorizationUrl(provider);
  redirect(authorizationUrl.toString());
}

export async function logOut() {
  await deleteUserSession();
  redirectToLogin({ redirectReason: null });
}

export async function unlinkAccount(provider: OAuthProvider) {
  const { userId } = await auth.protect();

  try {
    await unlinkUserAccount(provider, userId);
  } catch (error) {
    console.error(error);
  }
}

export async function verifyEmail(token: VerificationToken['token']) {
  try {
    const verificationToken = await db.getVerificationTokenByToken(token);

    if (!verificationToken || verificationToken.expirationTime < Date.now()) {
      throw new Error('Invalid or expired verification token');
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
    const errorMessage = error instanceof Error ? error.message : 'Email verification failed';

    console.error('Error verifying email: ', error);
    // TODO
    redirect(
      `${config.resendVerificationEmailRoute}?redirect_reason=${encodeURIComponent(errorMessage)}`,
    );
  }

  redirectToLogin({ redirectReason: 'Email verified successfully! You can now log in.' });
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
    console.error('Error resending verification email: ', error);

    return {
      isSuccess: false,
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }
}
