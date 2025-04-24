'use server';

import { redirect } from 'next/navigation';
import { db, type Session } from '@/db';
import { loginSchema } from '@/schemas';
import { auth, createUserSession, deleteUserSession } from './session';
import { comparePasswords } from './password';
import { redirectToLogin } from './util';
import { generateAuthorizationUrl, unlinkUserAccount } from './oauth';
import { type OAuthProvider } from './oauth/types';
import { sendVerificationEmail } from './email';
import { createEmailVerificationToken } from './verification-token';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ActionState<T extends Record<string, unknown> = {}> = {
  isSuccess: boolean;
  errors?: string[];
} & T;

type LoginActionState = ActionState<{ session?: Session }>;

export async function logIn(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
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
      await sendVerificationEmail(verificationToken.email, verificationToken.token);

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
