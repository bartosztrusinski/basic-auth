'use server';

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { type ZodSchema, type ZodType, type z } from 'zod';
import { redirect } from 'next/navigation';
import {
  db,
  type VerificationToken,
  type Session,
  type TwoFactorAttempt,
  type RecoveryCode,
  type TwoFactorSetup,
} from '@/db';
import { env } from '@/env';
import {
  signupSchema,
  loginSchema,
  resendVerificationEmailSchema,
  addPasswordSchema,
  twoFactorCodeSchema,
  recoveryCodeSchema,
} from '@/auth/schemas';
import {
  auth,
  createUserSession,
  currentUser,
  deleteAllUserSessions,
  deleteUserSession,
} from '@/auth/session';
import { generateAuthorizationUrl, deleteProviderAccount, type OAuthProvider } from '@/auth/oauth';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';
import { createEmailVerificationToken } from '@/auth/verification-token';
import { type AuthCode, AuthError, getAuthMessage } from '@/auth/message';
import { compareHash, decrypt, encrypt, hash } from '@/auth/crypto';
import { createTwoFactorAttempt } from '@/auth/two-factor-attempt';
import { createRecoveryCodes } from '@/auth/recovery-code';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

type ActionState<T extends ZodSchema = z.ZodAny> = ActionSuccess | ActionFailure<T>;

type ActionDataState<T extends Record<string, unknown>, U extends ZodSchema = z.ZodAny> =
  | (ActionSuccess & { data: T })
  | ActionFailure<U>;

type ActionSuccess = {
  isSuccess: true;
  authCode?: undefined;
  errors?: undefined;
};

type ActionFailure<T extends ZodType = z.ZodAny> = {
  isSuccess: false;
  authCode?: AuthCode;
  errors: string | string[];
  data?: undefined;
  fields?: Partial<z.infer<T>>;
};

async function signUp(_: unknown, formData: FormData): Promise<ActionState<typeof signupSchema>> {
  const { data, error } = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: {
        email: formData.get('email') as string,
        name: formData.get('name') as string,
      },
    };
  }

  const { email, name, password } = data;

  try {
    const existingUser = await db.getUserByEmail(email);

    if (existingUser?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(existingUser.email, existingUser.name);

      return {
        isSuccess: true,
      };
    }

    if (!existingUser) {
      const hashedPassword = await hash(password);
      await db.createUser({ email, name, password: hashedPassword });
    }

    const verificationToken = await createEmailVerificationToken(email);
    await sendVerificationEmail(
      verificationToken.email,
      verificationToken.token,
      existingUser?.name ?? name,
    );

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'signup-failed', { email, name });
  }
}

async function logIn(
  _: unknown,
  formData: FormData,
): Promise<
  ActionDataState<
    { session?: Session; twoFactorToken?: TwoFactorAttempt['token'] },
    typeof loginSchema
  >
> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: {
        email: formData.get('email') as string,
      },
    };
  }

  const { email, password } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user?.password) {
      throw new AuthError('invalid-credentials');
    }

    const isCorrectPassword = await compareHash(password, user.password);

    if (!isCorrectPassword || !user.emailVerified) {
      throw new AuthError('invalid-credentials');
    }

    if (user.twoFactorSecret) {
      const { token } = await createTwoFactorAttempt(user.id);

      return {
        isSuccess: true,
        data: {
          twoFactorToken: token,
        },
      };
    }

    const session = await createUserSession({ userId: user.id, userRole: user.role });

    return {
      isSuccess: true,
      data: { session },
    };
  } catch (error) {
    return handleError(error, 'login-failed', { email });
  }
}

async function logInWithProvider(provider: OAuthProvider): Promise<ActionState> {
  let authorizationUrl: URL;

  try {
    authorizationUrl = await generateAuthorizationUrl(provider);
  } catch (error) {
    return handleError(error, 'oauth-login-failed');
  }

  redirect(authorizationUrl.toString());
}

async function linkAccount(provider: OAuthProvider): Promise<ActionState> {
  let authorizationUrl: URL;
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    authorizationUrl = await generateAuthorizationUrl(provider);
  } catch (error) {
    return handleError(error, 'oauth-link-failed');
  }

  redirect(authorizationUrl.toString());
}

async function unlinkAccount(provider: OAuthProvider): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteProviderAccount(provider, userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'oauth-unlink-failed');
  }
}

async function logOut(): Promise<ActionState> {
  try {
    await deleteUserSession();

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'logout-failed');
  }
}

async function logOutEverywhere(): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteAllUserSessions(userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'logout-everywhere-failed');
  }
}

async function verifyEmail(token: VerificationToken['token']): Promise<ActionState> {
  try {
    const verificationToken = await db.getVerificationTokenByToken(token);

    if (!verificationToken || verificationToken.expirationTime < Date.now()) {
      throw new AuthError('email-verification-expired');
    }

    const { email } = verificationToken;
    const user = await db.getUserByEmail(email);

    if (!user) {
      throw new Error('Email does not exist');
    }

    if (!user.emailVerified) {
      await db.updateUser(user.id, { emailVerified: Date.now() });
    }

    await db.deleteVerificationToken(verificationToken.email);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'email-verification-failed');
  }
}

async function resendVerificationEmail(
  _: unknown,
  formData: FormData,
): Promise<ActionState<typeof resendVerificationEmailSchema>> {
  const { data, error } = resendVerificationEmailSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
      fields: {
        email: formData.get('email') as string,
      },
    };
  }

  const { email } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (user?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(user.email, user.name);
    }

    if (user && !user.emailVerified) {
      const verificationToken = await createEmailVerificationToken(user.email);
      await sendVerificationEmail(verificationToken.email, verificationToken.token, user.name);
    }

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'verification-email-not-sent', { email });
  }
}

async function addPassword(_: unknown, formData: FormData): Promise<ActionState> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (user.hasPassword) {
      throw new AuthError('password-already-set');
    }

    const { data, error } = addPasswordSchema.safeParse(Object.fromEntries(formData.entries()));

    if (error) {
      return {
        isSuccess: false,
        errors: error.errors.map((err) => err.message),
      };
    }

    const { password } = data;

    const hashedPassword = await hash(password);

    await db.updateUser(user.id, {
      password: hashedPassword,
    });

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'password-not-set');
  }
}

async function deleteCurrentUser(): Promise<ActionState> {
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    await deleteAllUserSessions(userId);
    await db.deleteUser(userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'account-deletion-failed');
  }
}

async function initiateTwoFactorAuth(): Promise<
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

    const secret = new OTPAuth.Secret({ size: 20 }).base32;
    const encryptedSecret = encrypt(secret, Buffer.from(env.ENCRYPTION_KEY, 'base64'));

    await db.deleteTwoFactorSetup(user.id);
    await db.createTwoFactorSetup({
      userId: user.id,
      secret: encryptedSecret,
      expirationTime: Date.now() + serverConfig.twoFactorSetupExpirationInSeconds * 1000,
    });

    const totp = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret,
    });

    const url = totp.toString();
    const qrCode = await QRCode.toDataURL(url);

    return {
      isSuccess: true,
      data: {
        secret,
        qrCode,
      },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

async function enableTwoFactorAuth(
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
      return {
        isSuccess: false,
        errors: error.errors.map((err) => err.message),
      };
    }

    const { code } = data;

    const twoFactorSetup = await db.getUserTwoFactorSetup(user.id);

    if (!twoFactorSetup) {
      throw new AuthError('two-factor-setup-failed');
    }

    if (twoFactorSetup.expirationTime < Date.now()) {
      throw new AuthError('two-factor-expired');
    }

    const decryptedSecret = decrypt(
      twoFactorSetup.secret,
      Buffer.from(env.ENCRYPTION_KEY, 'base64'),
    );

    const totp = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret: decryptedSecret,
    });

    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await db.deleteTwoFactorSetup(user.id);
    await db.updateUser(user.id, {
      twoFactorSecret: twoFactorSetup.secret,
    });

    const recoveryCodes = await createRecoveryCodes(user.id);

    return {
      isSuccess: true,
      data: {
        recoveryCodes,
      },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

async function disableTwoFactorAuth(): Promise<ActionState> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (!user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-not-enabled');
    }

    await db.updateUser(user.id, { twoFactorSecret: undefined });
    await db.deleteUserRecoveryCodes(user.id);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'two-factor-disable-failed');
  }
}

async function useRecoveryCode(
  token: TwoFactorAttempt['token'],
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ session: Session }>> {
  const { data, error } = recoveryCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { code } = data;

  try {
    const twoFactorAttempt = await db.getTwoFactorAttemptByToken(token);

    if (!twoFactorAttempt) {
      throw new AuthError('two-factor-invalid-code');
    }

    if (twoFactorAttempt.expirationTime < Date.now()) {
      throw new AuthError('two-factor-expired');
    }

    const user = await db.getUserById(twoFactorAttempt.userId);

    if (!user) {
      throw new AuthError('two-factor-invalid-code');
    }

    if (!user.twoFactorSecret) {
      throw new AuthError('two-factor-not-enabled');
    }

    const activeRecoveryCodes = await db.getActiveRecoveryCodes(user.id);

    let correctCode: RecoveryCode | null = null;
    for (const recoveryCode of activeRecoveryCodes) {
      const isMatch = await compareHash(code, recoveryCode.code);

      if (isMatch) {
        correctCode = recoveryCode;
        break;
      }
    }

    if (!correctCode) {
      throw new AuthError('recovery-code-invalid');
    }

    await db.useRecoveryCode(correctCode);
    await db.deleteTwoFactorAttempt(token);

    const session = await createUserSession({
      userId: user.id,
      userRole: user.role,
    });

    return {
      isSuccess: true,
      data: {
        session,
      },
    };
  } catch (error) {
    return handleError(error, 'recovery-code-failed');
  }
}

async function verifyTwoFactorCode(
  token: TwoFactorAttempt['token'],
  _: unknown,
  formData: FormData,
): Promise<ActionDataState<{ session: Session }>> {
  const { data, error } = twoFactorCodeSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { code } = data;

  try {
    const twoFactorAttempt = await db.getTwoFactorAttemptByToken(token);

    if (!twoFactorAttempt) {
      throw new AuthError('two-factor-invalid-code');
    }

    if (twoFactorAttempt.expirationTime < Date.now()) {
      throw new AuthError('two-factor-expired');
    }

    const user = await db.getUserById(twoFactorAttempt.userId);

    if (!user) {
      throw new AuthError('two-factor-invalid-code');
    }

    if (!user.twoFactorSecret) {
      throw new AuthError('two-factor-not-enabled');
    }

    const decryptedSecret = decrypt(
      user.twoFactorSecret,
      Buffer.from(env.ENCRYPTION_KEY, 'base64'),
    );

    const totp = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret: decryptedSecret,
    });

    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await db.deleteTwoFactorAttempt(token);

    const session = await createUserSession({
      userId: user.id,
      userRole: user.role,
    });

    return {
      isSuccess: true,
      data: {
        session,
      },
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

function handleError(
  error: unknown,
  defaultAuthCode: AuthCode,
  fields?: ActionFailure['fields'],
): ActionFailure {
  return {
    isSuccess: false,
    authCode: error instanceof AuthError ? error.authCode : undefined,
    errors: getAuthMessage(error instanceof AuthError ? error.authCode : defaultAuthCode).message,
    fields,
  };
}

export {
  signUp,
  logIn,
  logInWithProvider,
  linkAccount,
  unlinkAccount,
  logOut,
  logOutEverywhere,
  verifyEmail,
  resendVerificationEmail,
  addPassword,
  deleteCurrentUser,
  initiateTwoFactorAuth,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  verifyTwoFactorCode,
  useRecoveryCode,
};
