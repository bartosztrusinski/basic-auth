'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { AuthError, getSession, signIn, signOut, updateSession } from '@/lib';
import { createUser, updateUser } from '@/data';

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
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;

  try {
    await signIn(email, password);
  } catch (error) {
    return {
      error: error instanceof AuthError ? error.message : 'Failed to log in. Please try again.',
    };
  }

  redirect('/');
}

export async function register(_: unknown, formData: FormData): ActionResponse {
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;

  try {
    createUser({ email, password, name });
    await signIn(email, password);
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

export async function editProfile(_: unknown, formData: FormData): ActionResponse {
  const session = await getSession();

  if (!session) {
    return { error: 'Unauthorized' };
  }

  const { user } = session;
  const name = formData.get('name') as string;

  try {
    const updatedUser = updateUser(user.email, name);
    await updateSession(updatedUser);
  } catch (error) {
    return {
      error: error instanceof Error ? error.message : 'Failed to update profile. Please try again.',
    };
  }

  revalidatePath('/profile');
  return { success: 'Profile updated' };
}
