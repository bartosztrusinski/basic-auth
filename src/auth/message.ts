type AuthMessage = {
  type: 'success' | 'error';
  message: string;
};

export type AuthCode = keyof typeof authMessages;

export class AuthError extends Error {
  authCode: AuthCode;
  constructor(authCode: AuthCode, message?: string) {
    super(message);
    this.name = 'AuthError';
    this.authCode = authCode;
  }
}

export function getAuthMessage(code: AuthCode): AuthMessage {
  return authMessages[code];
}

const authMessages = {
  unauthenticated: {
    type: 'error',
    message: 'Your session has expired or you are not logged in. Please log in again to proceed.',
  },
  unauthorized: {
    type: 'error',
    message: 'You do not have permissions to access this page',
  },
  'signup-failed': {
    type: 'error',
    message: 'Could not create an account. Please try again.',
  },
  'login-failed': {
    type: 'error',
    message: 'Could not log in. Please try again.',
  },
  'invalid-credentials': {
    type: 'error',
    message: 'Invalid email or password',
  },
  'logout-failed': {
    type: 'error',
    message: 'Could not log out. Please try again.',
  },
  'logout-everywhere': {
    type: 'success',
    message: 'Logged out from all devices successfully!',
  },
  'logout-everywhere-failed': {
    type: 'error',
    message: 'Could not log out from all devices. Please try again.',
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
    message: 'Could not send verification email. Please try again.',
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
  'oauth-unlink': {
    type: 'success',
    message: 'Account unlinked successfully!',
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
  'password-not-set': {
    type: 'error',
    message: 'Could not set password. Please try again.',
  },
  'password-already-set': {
    type: 'error',
    message: 'Password is already set for this account.',
  },
  'account-deleted': {
    type: 'success',
    message: 'Account deleted successfully!',
  },
  'account-deletion-failed': {
    type: 'error',
    message: 'Could not delete account. Please try again.',
  },
  'two-factor-enabled': {
    type: 'success',
    message: 'Two-factor authentication enabled successfully!',
  },
  'two-factor-setup-failed': {
    type: 'error',
    message: 'Could not set up two-factor authentication. Please try again.',
  },
  'two-factor-already-enabled': {
    type: 'error',
    message: 'Two-factor authentication is already enabled.',
  },
  'two-factor-invalid-code': {
    type: 'error',
    message: 'Invalid two-factor authentication code. Please try again.',
  },
  'two-factor-expired': {
    type: 'error',
    message: 'Two-factor authentication code expired. Please try again.',
  },
  'two-factor-password-required': {
    type: 'error',
    message: 'You must set a password before enabling two-factor authentication.',
  },
  'two-factor-not-enabled': {
    type: 'error',
    message: 'Two-factor authentication is not enabled for this account.',
  },
  'two-factor-disabled': {
    type: 'success',
    message: 'Two-factor authentication disabled successfully!',
  },
  'two-factor-disable-failed': {
    type: 'error',
    message: 'Could not disable two-factor authentication. Please try again.',
  },
  'recovery-code-invalid': {
    type: 'error',
    message: 'Invalid recovery code. Please try again.',
  },
  'recovery-code-failed': {
    type: 'error',
    message: 'Could not use recovery code. Please try again.',
  },
} satisfies Record<string, AuthMessage>;
