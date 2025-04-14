import { type ReactNode } from 'react';
import { type User } from '@/db';
import { auth } from '../session';

type Props = {
  children: ReactNode;
  fallback?: ReactNode;
  role?: User['role'];
};

export async function Protect({ children, fallback, role }: Props) {
  const { userId, userRole } = await auth();

  if (!userId || userRole !== role) {
    return fallback ? <>{fallback}</> : null;
  }

  return <>{children}</>;
}
