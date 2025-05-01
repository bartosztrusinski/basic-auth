import { type ReactNode } from 'react';
import { auth } from '@/auth/session';

export async function LoggedOut({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  return userId ? null : <>{children}</>;
}
