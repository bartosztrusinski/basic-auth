'use server';

import { redirect } from 'next/navigation';
import { signIn, signOut } from '@/lib';

export async function logIn(formData: FormData) {
  try {
    await signIn(formData);
  } catch {
    console.error('Failed to log in');
    return;
  }

  redirect('/');
}

export async function logOut() {
  try {
    await signOut();
  } catch {
    console.error('Failed to log out');
    return;
  }

  redirect('/');
}
