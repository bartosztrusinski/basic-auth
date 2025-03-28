'use server';

import { AuthError, signIn } from '@/auth';
import { db } from '@/db';

type SuccessResponse = {
  success: string;
  error?: null;
  accessToken?: string;
};

type ErrorResponse = {
  success?: null;
  error: string;
  accessToken?: string;
};

type ActionResponse = Promise<SuccessResponse | ErrorResponse>;

export async function logIn(_: unknown, formData: FormData): ActionResponse {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    const { accessToken } = await signIn(email, password);
    return { success: 'Logged in successfully', accessToken };
  } catch (error) {
    return {
      error: error instanceof AuthError ? error.message : 'Failed to log in. Please try again.',
    };
  }
}

export async function register(_: unknown, formData: FormData): ActionResponse {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  try {
    await db.createUser({ email, password, name });
    await signIn(email, password);
    return { success: 'Registered successfully' };
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to register. Please try again.',
    };
  }
}
