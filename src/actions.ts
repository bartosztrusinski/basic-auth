'use server';

import { revalidatePath } from 'next/cache';
import { updateUser } from '@/db/user';
import { type RecoveryCode } from '@/db/recovery-code';
import { type TwoFactorSetup } from '@/db/two-factor-setup';
import { type VerificationToken } from '@/db/verification-token';
import { auth, redirectToLogin } from '@/auth/session';
import { redirectAuth } from '@/auth/util';
import { type OAuthProvider, type StateData } from '@/auth/oauth';
import * as actions from '@/auth/actions';
import { editProfileSchema } from '@/schemas';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
type ActionState<T extends Record<string, unknown> = {}> = ActionSuccess<T> | ActionFailure;

type ActionSuccess<T extends Record<string, unknown>> = {
  isSuccess: true;
  errors?: null;
} & T;

type ActionFailure = {
  isSuccess: false;
  errors?: string | string[];
};

export async function logOut() {
  const { isSuccess, errors } = await actions.logOut();

  if (isSuccess) {
    redirectToLogin({ authCode: null });
  }

  return {
    isSuccess,
    errors,
  };
}

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
    await updateUser(userId, userData);
    revalidatePath('/profile');

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

export async function linkAccount(
  provider: OAuthProvider,
  stateData: StateData = {},
): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.linkAccount(provider, stateData);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  return isSuccess ? { isSuccess } : { isSuccess, errors };
}

export async function unlinkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.unlinkAccount(provider);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (!isSuccess) {
    return {
      isSuccess,
      errors,
    };
  }

  revalidatePath('/profile');

  return { isSuccess };
}

export async function logOutEverywhere(): Promise<ActionState> {
  await auth.protect({ returnBackUrl: '/profile' });

  const { isSuccess, errors } = await actions.logOutEverywhere();

  if (isSuccess) {
    redirectToLogin({ authCode: 'logout-everywhere', syncAuth: true });
  }

  return {
    isSuccess,
    errors,
  };
}

export async function addPassword(_: unknown, formData: FormData): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.addPassword(null, formData);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (!isSuccess) {
    return {
      isSuccess,
      errors,
    };
  }

  revalidatePath('/profile');

  return { isSuccess };
}

export async function deleteCurrentUser(): Promise<ActionState> {
  await auth.protect({ returnBackUrl: '/profile' });

  const { isSuccess, errors } = await actions.deleteCurrentUser();

  if (isSuccess) {
    redirectToLogin({ authCode: 'account-deleted', syncAuth: true });
  }

  return {
    isSuccess,
    errors,
  };
}

export async function initializeTwoFactorAuth(): Promise<
  ActionState<{ qrCode: string; secret: TwoFactorSetup['secret'] }>
> {
  const { isSuccess, errors, authCode, data } = await actions.initializeTwoFactorAuth();

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (!isSuccess) {
    return {
      isSuccess,
      errors,
    };
  }

  const { qrCode, secret } = data;

  return {
    isSuccess,
    qrCode,
    secret,
  };
}

export async function enableTwoFactorAuth(
  _: unknown,
  formData: FormData,
): Promise<ActionState<{ recoveryCodes: RecoveryCode['code'][] }>> {
  const { isSuccess, errors, authCode, data } = await actions.enableTwoFactorAuth(null, formData);

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (!isSuccess) {
    return {
      isSuccess,
      errors,
    };
  }

  const { recoveryCodes } = data;

  return { isSuccess, recoveryCodes };
}

export async function disableTwoFactorAuth(): Promise<ActionState> {
  const { isSuccess, errors, authCode } = await actions.disableTwoFactorAuth();

  await auth.protect({ returnBackUrl: '/profile', authCode });

  if (!isSuccess) {
    return {
      isSuccess,
      errors,
    };
  }

  revalidatePath('/profile');

  return { isSuccess };
}
