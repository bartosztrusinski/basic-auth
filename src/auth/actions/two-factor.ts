import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { updateUser } from '@/data/user';
import { type Session } from '@/data/session';
import {
  type RecoveryCode,
  deleteUserRecoveryCodes,
  getActiveRecoveryCodes,
  consumeRecoveryCode,
} from '@/data/recovery-code';
import {
  type TwoFactorAttempt,
  getTwoFactorAttemptByToken,
  deleteTwoFactorAttempt,
} from '@/data/two-factor-attempt';
import {
  type TwoFactorSetup,
  createTwoFactorSetup,
  getUserTwoFactorSetup,
  deleteTwoFactorSetup,
} from '@/data/two-factor-setup';
import { encrypt, decrypt, hashHighEntropy, compareHashLowEntropy } from '@/auth/crypto';
import { AuthError } from '@/auth/message';
import { generateRecoveryCodes } from '@/auth/recovery-code';
import { twoFactorCodeSchema, recoveryCodeSchema } from '@/auth/schemas';
import { currentUser, createUserSession } from '@/auth/session';
import config from '@/auth/config';
import { handleError } from './util';
import { type ActionDataState, type ActionState } from './types';

export async function initializeTwoFactorAuth(): Promise<
  ActionDataState<{ secret: TwoFactorSetup['secret']; qrCode: string }>
> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (!user.hasPassword) {
      throw new AuthError('two-factor-password-required');
    }

    if (user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-already-enabled');
    }

    const secret = new OTPAuth.Secret({ size: 20 });
    const encryptedSecret = encrypt(Buffer.from(secret.bytes));

    await createTwoFactorSetup({ userId: user.id, secret: encryptedSecret });

    const totp = new OTPAuth.TOTP({ issuer: config.appName, label: user.email, secret });
    const url = totp.toString();
    const qrCode = await QRCode.toDataURL(url);

    return {
      isSuccess: true,
      data: { secret: secret.base32, qrCode },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

export async function enableTwoFactorAuth(
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ recoveryCodes: RecoveryCode['code'][] }>> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (!user.hasPassword) {
      throw new AuthError('two-factor-password-required');
    }

    if (user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-already-enabled');
    }

    const { data, error } = twoFactorCodeSchema.safeParse(Object.fromEntries(formData.entries()));

    if (error) {
      return { isSuccess: false, errors: error.errors.map((err) => err.message) };
    }

    const { code } = data;
    const twoFactorSetup = await getUserTwoFactorSetup(user.id);

    if (!twoFactorSetup || twoFactorSetup.expiresAt < new Date()) {
      throw new AuthError('two-factor-expired');
    }

    const decryptedSecret = decrypt(twoFactorSetup.secret);
    const secret = new OTPAuth.Secret({ buffer: decryptedSecret });
    const totp = new OTPAuth.TOTP({ issuer: config.appName, label: user.email, secret });
    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await deleteTwoFactorSetup(user.id);
    await updateUser(user.id, { twoFactorSecret: twoFactorSetup.secret });

    const recoveryCodes = await generateRecoveryCodes(user.id);

    return {
      isSuccess: true,
      data: { recoveryCodes },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

export async function disableTwoFactorAuth(): Promise<ActionState> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (!user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-not-enabled');
    }

    await updateUser(user.id, { twoFactorSecret: null });
    await deleteUserRecoveryCodes(user.id);

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'two-factor-disable-failed');
  }
}

export async function verifyTwoFactorCode(
  token: TwoFactorAttempt['token'],
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ session: Session }>> {
  const { data, error } = twoFactorCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return { isSuccess: false, errors: error.errors.map((err) => err.message) };
  }

  const { code } = data;

  try {
    const hashedToken = hashHighEntropy(token);
    const twoFactorAttempt = await getTwoFactorAttemptByToken(hashedToken);

    if (!twoFactorAttempt || twoFactorAttempt.expiresAt < new Date()) {
      throw new AuthError('two-factor-login-expired');
    }

    const { user } = twoFactorAttempt;

    if (!user.twoFactorSecret) {
      throw new AuthError('two-factor-not-enabled');
    }

    const decryptedSecret = decrypt(user.twoFactorSecret);
    const secret = new OTPAuth.Secret({ buffer: decryptedSecret });
    const totp = new OTPAuth.TOTP({ issuer: config.appName, label: user.email, secret });
    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await deleteTwoFactorAttempt(hashedToken);

    const session = await createUserSession(user.id);

    return {
      isSuccess: true,
      data: { session },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

export async function useRecoveryCode(
  token: TwoFactorAttempt['token'],
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ session: Session }>> {
  const { data, error } = recoveryCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return { isSuccess: false, errors: error.errors.map((err) => err.message) };
  }

  const { code } = data;

  try {
    const hashedToken = hashHighEntropy(token);
    const twoFactorAttempt = await getTwoFactorAttemptByToken(hashedToken);

    if (!twoFactorAttempt || twoFactorAttempt.expiresAt < new Date()) {
      throw new AuthError('two-factor-login-expired');
    }

    const { user } = twoFactorAttempt;

    if (!user.twoFactorSecret) {
      throw new AuthError('two-factor-not-enabled');
    }

    const activeRecoveryCodes = await getActiveRecoveryCodes(user.id);

    let correctCode: RecoveryCode | null = null;
    for (const recoveryCode of activeRecoveryCodes) {
      const isMatch = await compareHashLowEntropy(code, recoveryCode.code);

      if (isMatch) {
        correctCode = recoveryCode;
        break;
      }
    }

    if (!correctCode) {
      throw new AuthError('recovery-code-invalid');
    }

    await consumeRecoveryCode(correctCode);
    await deleteTwoFactorAttempt(hashedToken);

    const session = await createUserSession(user.id);

    return {
      isSuccess: true,
      data: { session },
    };
  } catch (error) {
    return handleError(error, 'recovery-code-failed');
  }
}
