'use server';

import { db } from '@/db';
import { editProfileSchema } from '@/schemas';
import { auth, updateUserSession } from '@/auth/session';

type ActionState = {
  isSuccess: boolean;
  errors?: string[];
};

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
