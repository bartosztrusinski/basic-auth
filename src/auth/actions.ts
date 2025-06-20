'use server';

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { type ZodSchema, type ZodType, type z } from 'zod';
import { redirect } from 'next/navigation';
import { getUserByEmail, createUser, updateUser, deleteUser } from '@/db/user';
import {
  getVerificationTokenByToken,
  deleteVerificationToken,
  type VerificationToken,
  createVerificationToken,
} from '@/db/verification-token';
import {
  deleteUserRecoveryCodes,
  getActiveRecoveryCodes,
  consumeRecoveryCode,
  type RecoveryCode,
} from '@/db/recovery-code';
import {
  getTwoFactorAttemptByToken,
  deleteTwoFactorAttempt,
  type TwoFactorAttempt,
  createTwoFactorAttempt,
} from '@/db/two-factor-attempt';
import {
  deleteTwoFactorSetup,
  createTwoFactorSetup,
  getUserTwoFactorSetup,
  type TwoFactorSetup,
} from '@/db/two-factor-setup';
import { type Session } from '@/db/session';
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
import {
  generateAuthorizationUrl,
  deleteProviderAccount,
  type OAuthProvider,
  type StateData,
} from '@/auth/oauth';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';
import { type AuthCode, AuthError, getAuthMessage } from '@/auth/message';
import {
  hashLowEntropy,
  hashHighEntropy,
  compareHashLowEntropy,
  decrypt,
  encrypt,
  generateToken,
} from '@/auth/crypto';
import { generateRecoveryCodes } from '@/auth/recovery-code';
import config from '@/auth/config';

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
    let user = await getUserByEmail(email);

    if (user?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(user.email, user.name);

      return {
        isSuccess: true,
      };
    }

    if (!user) {
      const hashedPassword = await hashLowEntropy(password);
      user = await createUser({ email, name, password: hashedPassword });
    }

    const { token, hashedToken } = generateToken();
    await createVerificationToken({ token: hashedToken, userId: user.id });
    await sendVerificationEmail(email, token, user.name);

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
    Partial<{ session: Session; twoFactorToken: TwoFactorAttempt['token'] }>,
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
    const user = await getUserByEmail(email);

    if (!user?.password) {
      throw new AuthError('invalid-credentials');
    }

    const isCorrectPassword = await compareHashLowEntropy(password, user.password);

    if (!isCorrectPassword || !user.emailVerified) {
      throw new AuthError('invalid-credentials');
    }

    if (user.twoFactorSecret) {
      const { token, hashedToken } = generateToken();
      await createTwoFactorAttempt({ token: hashedToken, userId: user.id });

      return {
        isSuccess: true,
        data: {
          twoFactorToken: token,
        },
      };
    }

    const session = await createUserSession(user.id);

    return {
      isSuccess: true,
      data: { session },
    };
  } catch (error) {
    return handleError(error, 'login-failed', { email });
  }
}

async function logInWithProvider(
  provider: OAuthProvider,
  stateData: StateData = {},
): Promise<ActionState> {
  let authorizationUrl: URL;

  try {
    authorizationUrl = await generateAuthorizationUrl(provider, stateData);
  } catch (error) {
    return handleError(error, 'oauth-login-failed');
  }

  redirect(authorizationUrl.toString());
}

async function linkAccount(
  provider: OAuthProvider,
  stateData: StateData = {},
): Promise<ActionState> {
  let authorizationUrl: URL;
  const { userId } = await auth();

  try {
    if (!userId) {
      throw new AuthError('unauthenticated');
    }

    authorizationUrl = await generateAuthorizationUrl(provider, stateData);
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
    const hashedToken = hashHighEntropy(token);
    const verificationToken = await getVerificationTokenByToken(hashedToken);

    if (!verificationToken || verificationToken.expiresAt < new Date()) {
      throw new AuthError('email-verification-expired');
    }

    const { user } = verificationToken;

    if (!user.emailVerified) {
      await updateUser(user.id, { emailVerified: new Date() });
    }

    await deleteVerificationToken(user.id);

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
    const user = await getUserByEmail(email);

    if (user?.emailVerified) {
      await sendExistingUserLoginGuidanceEmail(user.email, user.name);
    }

    if (user && !user.emailVerified) {
      const { token, hashedToken } = generateToken();
      await createVerificationToken({ token: hashedToken, userId: user.id });
      await sendVerificationEmail(user.email, token, user.name);
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
    const hashedPassword = await hashLowEntropy(password);

    await updateUser(user.id, { password: hashedPassword });

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
    await deleteUser(userId);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'account-deletion-failed');
  }
}

async function initializeTwoFactorAuth(): Promise<
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

    await createTwoFactorSetup({
      userId: user.id,
      secret: encryptedSecret,
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
        secret: secret.base32,
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

    const twoFactorSetup = await getUserTwoFactorSetup(user.id);

    if (!twoFactorSetup || twoFactorSetup.expiresAt < new Date()) {
      throw new AuthError('two-factor-expired');
    }

    const decryptedSecret = decrypt(twoFactorSetup.secret);
    const secret = new OTPAuth.Secret({
      buffer: decryptedSecret,
    });

    const totp = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret,
    });

    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await deleteTwoFactorSetup(user.id);
    await updateUser(user.id, { twoFactorSecret: twoFactorSetup.secret });

    const recoveryCodes = await generateRecoveryCodes(user.id);

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

    await updateUser(user.id, { twoFactorSecret: null });
    await deleteUserRecoveryCodes(user.id);

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'two-factor-disable-failed');
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
    const secret = new OTPAuth.Secret({
      buffer: decryptedSecret,
    });

    const totp = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret,
    });

    const delta = totp.validate({ token: code, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await deleteTwoFactorAttempt(hashedToken);

    const session = await createUserSession(user.id);

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
      data: {
        session,
      },
    };
  } catch (error) {
    return handleError(error, 'recovery-code-failed');
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
  initializeTwoFactorAuth,
  enableTwoFactorAuth,
  disableTwoFactorAuth,
  verifyTwoFactorCode,
  useRecoveryCode,
};
