import { getAuthMessage, type AuthCode } from '@/auth/message';
import { Alert } from '@/components/ui/alert';

type Props = {
  authCode: AuthCode;
};

export function AuthAlert({ authCode }: Props) {
  const { type, message } = getAuthMessage(authCode);

  return <Alert variant={type} message={message} />;
}
