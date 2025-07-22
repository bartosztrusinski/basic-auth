import { AuthError, getAuthMessage, type AuthCode } from '@/auth/message';
import { type ActionFailure } from './types';

export function handleError(
  error: unknown,
  defaultAuthCode: AuthCode,
  fields?: ActionFailure['fields'],
): ActionFailure {
  console.error(error);

  return {
    isSuccess: false,
    authCode: error instanceof AuthError ? error.authCode : undefined,
    errors: getAuthMessage(error instanceof AuthError ? error.authCode : defaultAuthCode).message,
    fields,
  };
}
