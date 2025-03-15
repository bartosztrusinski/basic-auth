'use server';

import { redirect } from 'next/navigation';
import { AuthError, signIn, signOut } from '@/lib';
import { createUser } from '@/data';

type SuccessResponse = {
  success: string;
  error?: null;
};

type ErrorResponse = {
  success?: null;
  error: string;
};

type ActionResponse = Promise<SuccessResponse | ErrorResponse>;

export async function logIn(_: unknown, formData: FormData): ActionResponse {
  try {
    await signIn(formData);
  } catch (error) {
    return {
      error: error instanceof AuthError ? error.message : 'Failed to log in. Please try again.',
    };
  }

  redirect('/');
}

export async function register(_: unknown, formData: FormData): ActionResponse {
  try {
    createUser({
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      name: formData.get('name') as string,
    });
    await signIn(formData);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to register. Please try again.',
    };
  }

  redirect('/');
}

export async function logOut(): ActionResponse {
  try {
    await signOut();
  } catch {
    return { error: 'Failed to log out. Please try again.' };
  }

  redirect('/');
}
