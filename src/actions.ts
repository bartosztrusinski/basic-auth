'use server';

import { revalidatePath } from 'next/cache';
import { comparePasswords, generateSalt, hashPassword } from '@/auth/password';
import { createUserSession, deleteUserSession, auth, updateUserSession } from '@/auth/session';
import { db, type Session } from '@/db';
import { editProfileSchema, loginSchema, signupSchema } from '@/schemas';

type ActionState = {
  success?: boolean;
  errors?: string[];
};

export async function logIn(formData: FormData): Promise<ActionState & { session?: Session }> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, password } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user) {
      return {
        errors: ['Invalid email or password'],
      };
    }

    const isCorrectPassword = await comparePasswords(password, user.password, user.salt);

    if (!isCorrectPassword) {
      return {
        errors: ['Invalid email or password'],
      };
    }

    const session = await createUserSession({ userId: user.id, userRole: user.role });

    return {
      success: true,
      session,
    };
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }
}

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const { data, error } = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, name, password } = data;

  try {
    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    const user = await db.createUser({
      email,
      name,
      password: hashedPassword,
      salt,
    });

    if (!user) {
      throw new Error('User creation failed');
    }

    await createUserSession({ userId: user.id, userRole: user.role });
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }

  return {};
}

export async function logOut(_: ActionState): Promise<ActionState> {
  await deleteUserSession();

  return {
    success: true,
  };
}

export async function editProfile(
  formData: FormData,
): Promise<ActionState & { isUnauthenticated?: boolean }> {
  const { data, error } = editProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      errors: error.errors.map((err) => err.message),
    };
  }

  const { userId } = await auth();

  if (!userId) {
    revalidatePath('/');
    return {
      errors: ['User not authenticated'],
      isUnauthenticated: true,
    };
  }

  const { name, role } = data;

  try {
    const { role: newRole } = await db.updateUser(userId, { name, role });
    await updateUserSession({ userId, userRole: newRole });
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }

  return {
    success: true,
  };
}

export async function getAuth() {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  return {
    isLoggedIn,
    userId,
    userRole,
    expirationTime,
  };
}
