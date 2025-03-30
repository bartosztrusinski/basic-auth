'use server';

import { redirect } from 'next/navigation';
import { generateSalt, hashPassword } from '@/auth/password';
import { createUserSession } from '@/auth/session';
import { db } from '@/db';
import { signupSchema } from '@/schemas';

type ActionState = {
  errors?: string[];
};

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
