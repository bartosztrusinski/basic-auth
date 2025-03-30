'use server';

import { redirect } from 'next/navigation';
import { comparePasswords, generateSalt, hashPassword } from '@/auth/password';
import { createUserSession } from '@/auth/session';
import { db } from '@/db';
import { loginSchema, signupSchema } from '@/schemas';

type ActionState = {
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

  redirect('/');
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

  redirect('/');
}
