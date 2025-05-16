'use client';

import { getAuthMessage, type AuthCode } from '@/auth/message';
import { Alert } from '@/components/alert';

type Props = {
  authCode: AuthCode | null;
};

export function AuthAlert({ authCode }: Props) {
  if (!authCode) {
    return null;
  }

  const { type, message } = getAuthMessage(authCode);

  return <Alert variant={type} message={message} />;
}
