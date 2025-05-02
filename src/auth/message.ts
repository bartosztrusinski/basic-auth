import { getSearchParam } from '@/auth/util';
import config from '@/auth/config';

export type AuthMessage = {
  type: 'success' | 'error';
  message: string;
};

export type AuthCode = keyof typeof authMessages;

const authMessages = {
  unauthenticated: {
    type: 'error',
    message: 'Please log in to continue',
  },
  unauthorized: {
    type: 'error',
    message: 'You do not have permissions to access this page',
  },
  'invalid-credentials': {
    type: 'error',
    message: 'Invalid email or password',
  },
  'email-verified': {
    type: 'success',
    message: 'Email verified successfully! You can now log in.',
  },
  'email-verification-failed': {
    type: 'error',
    message: 'Email verification failed. Please try again.',
  },
  'email-verification-expired': {
    type: 'error',
    message: 'Email verification link expired. Please request a new one.',
  },
  'verification-email-sent': {
    type: 'success',
    message: 'Verification email has been sent! Please check your inbox.',
  },
  'verification-email-not-sent': {
    type: 'error',
    message: 'Failed to send verification email. Please try again.',
  },
  'oauth-login-failed': {
    type: 'error',
    message: 'Could not log in with provider. Please try again.',
  },
  'oauth-login-email-taken': {
    type: 'error',
    message:
      'An account already exists with this email address. Please log in using the original method. You can link your account after logging in.',
  },
  'oauth-link': {
    type: 'success',
    message: 'Account linked successfully!',
  },
  'oauth-link-failed': {
    type: 'error',
    message: 'Could not link provider. Please try again.',
  },
  'oauth-link-existing-account': {
    type: 'error',
    message: 'This account is already linked to another user.',
  },
  'oauth-unlink-failed': {
    type: 'error',
    message: 'Could not unlink provider. Please try again.',
  },
  'oauth-unlink-only-account': {
    type: 'error',
    message:
      'You must have at least one account linked to your profile. Please set a password or link another account',
  },
  'password-set': {
    type: 'success',
    message: 'Password set successfully!',
  },
} satisfies Record<string, AuthMessage>;

export function getAuthMessage(code: AuthCode): AuthMessage {
  return authMessages[code];
}

export async function getAuthCode(
  searchParams: Promise<Record<string, string | undefined>> | undefined,
): Promise<AuthCode | null> {
  const authCode = await getSearchParam<AuthCode>(searchParams, config.authCodeKey);
  return authCode;
}

export class AuthError extends Error {
  authCode: AuthCode;
  constructor(authCode: AuthCode, message?: string) {
    super(message);
    this.name = 'AuthError';
    this.authCode = authCode;
  }
}
