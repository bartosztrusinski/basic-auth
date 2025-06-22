import { AuthError, getAuthMessage, type AuthCode } from '@/auth/message';
import { type ActionFailure } from './types';

export function handleError(
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
