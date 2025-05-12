'use server';

import * as OTPAuth from 'otpauth';
import QRCode from 'qrcode';
import { redirect } from 'next/navigation';
import { db, type VerificationToken, type Session } from '@/db';
import {
  signupSchema,
  loginSchema,
  resendVerificationEmailSchema,
  addPasswordSchema,
  totpSchema,
} from '@/auth/schemas';
import {
  auth,
  createUserSession,
  currentUser,
  deleteAllUserSessions,
  deleteUserSession,
} from '@/auth/session';
import { comparePasswords, generateSalt, hashPassword } from '@/auth/password';
import { generateAuthorizationUrl, deleteProviderAccount, type OAuthProvider } from '@/auth/oauth';
import { sendExistingUserLoginGuidanceEmail, sendVerificationEmail } from '@/auth/email';
import { createEmailVerificationToken } from '@/auth/verification-token';
import { type AuthCode, AuthError, getAuthMessage } from '@/auth/message';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

type ActionState = {
  isSuccess: boolean;
  authCode?: AuthCode;
  errors?: string | string[];
};

async function signUp(_: unknown, formData: FormData): Promise<ActionState> {
  const { data, error } = signupSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
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
      const salt = generateSalt();
      const hashedPassword = await hashPassword(password, salt);
      await db.createUser({ email, name, password: hashedPassword, salt });
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
    return handleError(error, 'signup-failed');
  }
}

async function logIn(_: unknown, formData: FormData): Promise<ActionState & { session?: Session }> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, password } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user?.password || !user?.salt) {
      throw new AuthError('invalid-credentials');
    }

    const isCorrectPassword = await comparePasswords(password, user.password, user.salt);

    if (!isCorrectPassword || !user.emailVerified) {
      throw new AuthError('invalid-credentials');
    }

    const session = await createUserSession({ userId: user.id, userRole: user.role });

    return {
      isSuccess: true,
      session,
    };
  } catch (error) {
    return handleError(error, 'login-failed');
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

async function resendVerificationEmail(_: unknown, formData: FormData): Promise<ActionState> {
  const { data, error } = resendVerificationEmailSchema.safeParse(
    Object.fromEntries(formData.entries()),
  );

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
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
    return handleError(error, 'verification-email-not-sent');
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

    const salt = generateSalt();
    const hashedPassword = await hashPassword(password, salt);

    await db.updateUser(user.id, {
      password: hashedPassword,
      salt,
    });

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'password-set-failed');
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
  ActionState & { secret?: string; qrCode?: string }
> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    if (user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-already-enabled');
    }

    const secret = new OTPAuth.Secret({ size: 20 }).base32;

    await db.deleteTwoFactorSetup(user.id);

    const twoFactorSetup = await db.createTwoFactorSetup({
      userId: user.id,
      secret,
      expirationTime: Date.now() + serverConfig.twoFactorSetupExpirationInSeconds * 1000,
    });

    const totpHandler = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret: twoFactorSetup.secret,
    });

    const url = totpHandler.toString();
    const qrCode = await QRCode.toDataURL(url);

    return {
      isSuccess: true,
      secret: twoFactorSetup.secret,
      qrCode,
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

async function enableTwoFactorAuth(_: unknown, formData: FormData): Promise<ActionState> {
  const user = await currentUser();

  try {
    if (!user) {
      throw new AuthError('unauthenticated');
    }

    const { data, error } = totpSchema.safeParse(Object.fromEntries(formData.entries()));

    if (error) {
      return {
        isSuccess: false,
        errors: error.errors.map((err) => err.message),
      };
    }

    const { token } = data;

    if (user.isTwoFactorEnabled) {
      throw new AuthError('two-factor-already-enabled');
    }

    const twoFactorSetup = await db.getUserTwoFactorSetup(user.id);

    if (!twoFactorSetup) {
      throw new AuthError('two-factor-setup-failed');
    }

    if (twoFactorSetup.expirationTime < Date.now()) {
      throw new AuthError('two-factor-expired');
    }

    const totpHandler = new OTPAuth.TOTP({
      issuer: config.appName,
      label: user.email,
      secret: twoFactorSetup.secret,
    });

    const delta = totpHandler.validate({ token, window: 0 });

    if (delta !== 0) {
      throw new AuthError('two-factor-invalid-code');
    }

    await db.deleteTwoFactorSetup(user.id);
    await db.updateUser(user.id, {
      isTwoFactorEnabled: true,
      twoFactorSecret: twoFactorSetup.secret,
    });

    return {
      isSuccess: true,
    };
  } catch (error) {
    return handleError(error, 'two-factor-setup-failed');
  }
}

function handleError(error: unknown, defaultAuthCode: AuthCode): ActionState {
  return {
    isSuccess: false,
    authCode: error instanceof AuthError ? error.authCode : undefined,
    errors: getAuthMessage(error instanceof AuthError ? error.authCode : defaultAuthCode).message,
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
};
