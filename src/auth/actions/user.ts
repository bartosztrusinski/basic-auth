import { updateUser, deleteUser } from '@/data/user';
import { hashLowEntropy } from '@/auth/crypto';
import { AuthError } from '@/auth/message';
import { addPasswordSchema } from '@/auth/schemas';
import { currentUser, auth, deleteAllUserSessions } from '@/auth/session';
import { handleError } from './util';
import { type ActionState } from './types';

export async function addPassword(_: unknown, formData: FormData): Promise<ActionState> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (user.hasPassword) {
      throw new AuthError('password-already-set');
    }

    const { data, error } = addPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (error) {
      return {
        isSuccess: false,
        errors: error.errors.map((err) => err.message),
      };
    }

    const { password } = data;
    const hashedPassword = await hashLowEntropy(password);

    await updateUser(user.id, { password: hashedPassword });

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'password-not-set');
  }
}

export async function deleteCurrentUser(): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteAllUserSessions(userId);
    await deleteUser(userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'account-deletion-failed');
  }
}
