import { updateUser, getUserByEmail } from '@/data/user';
import {
  type VerificationToken,
  getVerificationTokenByToken,
  deleteVerificationToken,
  createVerificationToken,
} from '@/data/verification-token';
import { hashHighEntropy, generateToken } from '@/auth/crypto';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';
import { AuthError } from '@/auth/message';
import { resendVerificationEmailSchema } from '@/auth/schemas';
import { handleError } from './util';
import { type ActionState } from './types';

export async function verifyEmail(token: VerificationToken['token']): Promise<ActionState> {
  try {
    const hashedToken = hashHighEntropy(token);
    const verificationToken = await getVerificationTokenByToken(hashedToken);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new AuthError('email-verification-expired');
    }

    const { user } = verificationToken;

    if (!user.emailVerified) {
      await updateUser(user.id, { emailVerified: new Date() });
    }

    await deleteVerificationToken(user.id);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'email-verification-failed');
  }
}

export async function resendVerificationEmail(
  _: unknown,
  formData: FormData,
): Promise<ActionState<typeof resendVerificationEmailSchema>> {
  const { data, error } = resendVerificationEmailSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: {
        email: formData.get('email') as string,
      },
    };
  }

  const { email } = data;

  try {
    const user = await getUserByEmail(email);

    if (user?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(user.email, user.name);
    }

    if (user && !user.emailVerified) {
      const { token, hashedToken } = generateToken();
      await createVerificationToken({ token: hashedToken, userId: user.id });
      await sendVerificationEmail(user.email, token, user.name);
    }

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'verification-email-not-sent', { email });
  }
}
