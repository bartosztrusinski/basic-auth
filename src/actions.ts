'use server';

import { db } from '@/db';
import { editProfileSchema, signupSchema } from '@/schemas';
import { generateSalt, hashPassword } from '@/auth/password';
import { auth, updateUserSession } from '@/auth/session';
import { createEmailVerificationToken } from '@/auth/verification-token';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';

type ActionState = {
  isSuccess: boolean;
  errors?: string[];
};

export async function signUp(_: unknown, formData: FormData): Promise<ActionState> {
  const { data, error } = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, name, password } = data;

  try {
    const existingUser = await db.getUserByEmail(email);

    if (existingUser?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(existingUser.email, existingUser.name);

      return {
        isSuccess: true,
      };
    }

    if (!existingUser) {
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);
      await db.createUser({ email, name, password: hashedPassword, salt });
    }

    const verificationToken = await createEmailVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      existingUser?.name ?? name,
    );

    return {
      isSuccess: true,
    };
  } catch {
    return {
      isSuccess: false,
      errors: ['An error occurred while creating your account. Please try again.'],
    };
  }
}

export async function editProfile(_: unknown, formData: FormData): Promise<ActionState> {
  const { data: userData, error } = editProfileSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { userId } = await auth.protect({ returnBackUrl: '/profile' });

  try {
    const { role } = await db.updateUser(userId, userData);
    await updateUserSession({ userId, userRole: role });

    return {
      isSuccess: true,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [
        error instanceof Error
          ? error.message
          : 'An error occurred while updating your profile. Please try again.',
      ],
    };
  }
}
