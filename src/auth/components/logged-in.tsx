import { type ReactNode } from 'react';
import { auth } from '@/auth/session';

export async function LoggedIn({ children }: { children: ReactNode }) {
  const { userId } = await auth();

  return userId ? <>{children}</> : null;
}
