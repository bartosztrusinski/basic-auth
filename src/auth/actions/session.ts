import { getUserByEmail, createUser } from '@/data/user';
import { createTwoFactorAttempt } from '@/data/two-factor-attempt';
import { createVerificationToken } from '@/data/verification-token';
import { createUserSession, deleteUserSession, auth, deleteAllUserSessions } from '@/auth/session';
import { hashLowEntropy, generateToken, compareHashLowEntropy } from '@/auth/crypto';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';
import { signupSchema, loginSchema } from '@/auth/schemas';
import { AuthError } from '@/auth/message';
import { handleError } from './util';
import { type ActionState, type ActionDataState } from './types';

export async function signUp(
  _: unknown,
  formData: FormData,
): Promise<ActionState<typeof signupSchema>> {
  const { data, error } = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: {
        email: formData.get('email') as string,
        name: formData.get('name') as string,
      },
    };
  }

  const { email, name, password } = data;

  try {
    let user = await getUserByEmail(email);

    if (user?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(user.email, user.name);
      return { isSuccess: true };
    }

    if (!user) {
      const hashedPassword = await hashLowEntropy(password);
      user = await createUser({ email, name, password: hashedPassword });
    }

    const { token, hashedToken } = generateToken();
    await createVerificationToken({ token: hashedToken, userId: user.id });
    await sendVerificationEmail(email, token, user.name);

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'signup-failed', { email, name });
  }
}

export async function logIn(
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ twoFactorToken?: string }, typeof loginSchema>> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: { email: formData.get('email') as string },
    };
  }

  const { email, password } = data;

  try {
    const user = await getUserByEmail(email);

    if (!user?.password) {
      throw new AuthError('invalid-credentials');
    }

    const isCorrectPassword = await compareHashLowEntropy(password, user.password);

    if (!isCorrectPassword || !user.emailVerified) {
      throw new AuthError('invalid-credentials');
    }

    if (user.twoFactorSecret) {
      const { token, hashedToken } = generateToken();
      await createTwoFactorAttempt({ token: hashedToken, userId: user.id });

      return {
        isSuccess: true,
        data: { twoFactorToken: token },
      };
    }

    await createUserSession(user.id);

    return { isSuccess: true, data: {} };
  } catch (error) {
    return handleError(error, 'login-failed', { email });
  }
}

export async function logOut(): Promise<ActionState> {
  try {
    await deleteUserSession();

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'logout-failed');
  }
}

export async function logOutEverywhere(): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteAllUserSessions(userId);

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'logout-everywhere-failed');
  }
}
