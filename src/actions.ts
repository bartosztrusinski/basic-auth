'use server';

import { redirect } from 'next/navigation';
import { generateSalt, hashPassword } from '@/auth/password';
import { createUserSession } from '@/auth/session';
import { db } from '@/db';

type ActionState = {
  error?: string;
  success?: string;
};

export async function signUp(_: ActionState, formData: FormData): Promise<ActionState> {
  const email = formData.get('email') as string;
  const name = formData.get('name') as string;
  const password = formData.get('password') as string;

  // Validate here

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
      error: error instanceof Error ? error.message : 'An unknown error occurred',
    };
  }

  redirect('/');
}
