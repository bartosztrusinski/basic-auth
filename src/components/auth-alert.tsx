'use client';

import { useRemoveAuthCode } from '@/auth/hooks/use-remove-auth-code';
import { getAuthMessage, type AuthCode } from '@/auth/message';
import { Alert } from '@/components/alert';

type Props = {
  authCode: AuthCode | null;
};

export function AuthAlert({ authCode }: Props) {
  const removeAuthCode = useRemoveAuthCode();

  if (!authCode) {
    return null;
  }

  const authMessage = getAuthMessage(authCode);

  return (
    <Alert variant={authMessage.type} message={authMessage.message} onClose={removeAuthCode} />
  );
}
