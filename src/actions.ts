'use server';

import { revalidatePath } from 'next/cache';
import { comparePasswords, generateSalt, hashPassword } from '@/auth/password';
import {
  createUserSession,
  deleteUserSession,
  getUserSession,
  updateUserSession,
} from '@/auth/session';
import { db } from '@/db';
import { editProfileSchema, loginSchema, signupSchema } from '@/schemas';

type ActionState = {
  success?: boolean;
  errors?: string[];
};

export async function logIn(_: ActionState, formData: FormData): Promise<ActionState> {
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

    await createUserSession(user);
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }

  return {};
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

    await createUserSession(user);
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }

  return {};
}

export async function logOut() {
  await deleteUserSession();
}

export async function editProfile(_: ActionState, formData: FormData): Promise<ActionState> {
  const { data, error } = editProfileSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      errors: error.errors.map((err) => err.message),
    };
  }

  const userSession = await getUserSession();

  if (!userSession) {
    revalidatePath('/profile');
    return {
      errors: ['User not authenticated'],
    };
  }

  const { id } = userSession;
  const { name, role } = data;

  try {
    const updatedUser = await db.updateUser(id, { name, role });
    await updateUserSession(updatedUser);
  } catch (error) {
    return {
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }

  return {
    success: true,
  };
}
