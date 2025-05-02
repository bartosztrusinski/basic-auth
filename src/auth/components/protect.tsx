import { type ReactNode } from 'react';
import { type BackendUser, currentUser } from '@/auth/session';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  when?: (user: BackendUser) => boolean;
};

export async function Protect({ children, fallback, when }: Props) {
  const user = await currentUser();

  if (!user || when?.(user)) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
