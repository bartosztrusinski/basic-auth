'use server';

import { revalidatePath } from 'next/cache';
import { db, type VerificationToken } from '@/db';
import { editProfileSchema } from '@/schemas';
import { auth, redirectToLogin, updateUserSession } from '@/auth/session';
import { redirectAuth } from '@/auth/util';
import { type OAuthProvider } from '@/auth/oauth';
import * as actions from '@/auth/actions';

type ActionState = {
  isSuccess: boolean;
  errors?: string | string[];
};

export async function editProfile(_: unknown, formData: FormData): Promise<ActionState> {
  const { data: userData, error } = editProfileSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { userId } = await auth.protect({ returnBackUrl: '/profile' });

  try {
    const { role } = await db.updateUser(userId, userData);
    await updateUserSession({ userId, userRole: role });

    return {
      isSuccess: true,
    };
  } catch {
    return {
      isSuccess: false,
      errors: 'An error occurred while updating your profile. Please try again.',
    };
  }
}

export async function verifyEmail(token: VerificationToken['token']): Promise<ActionState> {
  const { isSuccess, authCode } = await actions.verifyEmail(token);

  if (isSuccess) {
    redirectToLogin({ authCode: 'email-verified' });
  }

  redirectAuth('/resend-email', { authCode });
}

export async function linkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.linkAccount(provider);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  return {
    isSuccess,
    errors,
  };
}

export async function logOut(): Promise<ActionState> {
  const { isSuccess, errors } = await actions.logOut();

  if (isSuccess) {
    redirectToLogin({ authCode: null, returnBackUrl: '/profile', syncAuth: true });
  }

  return {
    isSuccess,
    errors,
  };
}

export async function logOutEverywhere(): Promise<ActionState> {
  await auth.protect({ returnBackUrl: '/profile' });

  const { isSuccess, errors } = await actions.logOutEverywhere();

  if (isSuccess) {
    redirectToLogin({ authCode: 'logout-everywhere', returnBackUrl: '/profile', syncAuth: true });
  }

  return {
    isSuccess,
    errors,
  };
}

export async function addPassword(formData: FormData): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.addPassword(null, formData);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (isSuccess) {
    revalidatePath('/profile');
  }

  return {
    isSuccess,
    errors,
  };
}

export async function deleteCurrentUser(): Promise<ActionState> {
  await auth.protect({ returnBackUrl: '/profile' });

  const { isSuccess, errors } = await actions.deleteCurrentUser();

  if (isSuccess) {
    redirectToLogin({ authCode: 'account-deleted', returnBackUrl: '/profile', syncAuth: true });
  }

  return {
    isSuccess,
    errors,
  };
}

export async function unlinkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.unlinkAccount(provider);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (isSuccess) {
    revalidatePath('/profile');
  }

  return {
    isSuccess,
    errors,
  };
}

export async function initiateTwoFactorAuth(): ReturnType<typeof actions.initiateTwoFactorAuth> {
  const { isSuccess, errors, authCode, qrCode, secret } = await actions.initiateTwoFactorAuth();

  await auth.protect({ returnBackUrl: '/profile', authCode });

  return {
    isSuccess,
    errors,
    authCode,
    qrCode,
    secret,
  };
}

export async function enableTwoFactorAuth(formData: FormData): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.enableTwoFactorAuth(null, formData);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (isSuccess) {
    revalidatePath('/profile');
  }

  return {
    isSuccess,
    errors,
  };
}
