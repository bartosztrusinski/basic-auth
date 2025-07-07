'use server';

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { transaction } from '@/db';
import { updateUser } from '@/data/user';
import {
  type RecoveryCode,
  deleteUserRecoveryCodes,
  getActiveRecoveryCodes,
  consumeRecoveryCode,
  createRecoveryCodes,
} from '@/data/recovery-code';
import { getTwoFactorAttemptByToken, deleteTwoFactorAttempt } from '@/data/two-factor-attempt';
import { createTwoFactorSetup, deleteTwoFactorSetup } from '@/data/two-factor-setup';
import { encrypt, decrypt, hashHighEntropy, generateCodes, findCode } from '@/auth/crypto';
import { AuthError } from '@/auth/message';
import { twoFactorCodeSchema, recoveryCodeSchema } from '@/auth/schemas';
import { currentUser, createUserSession } from '@/auth/session';
import config from '@/auth/config';
import { handleError } from './util';
import { type ActionDataState, type ActionState } from './types';

export async function initializeTwoFactorAuth(): Promise<
  ActionDataState<{ secret: string; qrCode: string }>
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

    const recoveryCodes = await transaction(async (tx) => {
      const twoFactorSetup = await deleteTwoFactorSetup(user.id, tx);

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

      await updateUser(user.id, { twoFactorSecret: twoFactorSetup.secret }, tx);

      const { codes, hashedCodes } = await generateCodes(
        config.recoveryCodeCount,
        config.recoveryCodeLength,
      );

      await createRecoveryCodes(
        hashedCodes.map((code) => ({ code, userId: user.id })),
        tx,
      );

      return codes;
    });

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

    await transaction(async (tx) => {
      await updateUser(user.id, { twoFactorSecret: null }, tx);
      await deleteUserRecoveryCodes(user.id, tx);
    });

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'two-factor-disable-failed');
  }
}

export async function verifyTwoFactorCode(
  token: string,
  _: unknown,
  formData: FormData,
): Promise<ActionState> {
  const { data, error } = twoFactorCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return { isSuccess: false, errors: error.errors.map((err) => err.message) };
  }

  const { code } = data;

  try {
    const hashedToken = hashHighEntropy(token);

    await transaction(async (tx) => {
      const twoFactorAttempt = await getTwoFactorAttemptByToken(hashedToken, tx);

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

      await deleteTwoFactorAttempt(hashedToken, tx);
      await createUserSession(user.id, tx);
    });

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'two-factor-login-failed');
  }
}

export async function useRecoveryCode(
  token: string,
  _: unknown,
  formData: FormData,
): Promise<ActionState> {
  const { data, error } = recoveryCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return { isSuccess: false, errors: error.errors.map((err) => err.message) };
  }

  const { code } = data;

  try {
    const hashedToken = hashHighEntropy(token);

    await transaction(async (tx) => {
      const twoFactorAttempt = await getTwoFactorAttemptByToken(hashedToken, tx);

      if (!twoFactorAttempt || twoFactorAttempt.expiresAt < new Date()) {
        throw new AuthError('two-factor-login-expired');
      }

      const { user } = twoFactorAttempt;

      if (!user.twoFactorSecret) {
        throw new AuthError('two-factor-not-enabled');
      }

      const activeRecoveryCodes = await getActiveRecoveryCodes(user.id, tx);
      const correctCode = await findCode(code, activeRecoveryCodes);

      if (!correctCode) {
        throw new AuthError('recovery-code-invalid');
      }

      const wasCodeConsumed = await consumeRecoveryCode({ code: correctCode, userId: user.id }, tx);

      if (!wasCodeConsumed) {
        throw new AuthError('recovery-code-invalid');
      }

      await deleteTwoFactorAttempt(hashedToken, tx);
      await createUserSession(user.id, tx);
    });

    return { isSuccess: true };
  } catch (error) {
    return handleError(error, 'recovery-code-failed');
  }
}
