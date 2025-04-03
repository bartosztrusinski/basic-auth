import { type ReactNode } from 'react';
import { getUserSession } from '@/auth/session';

export async function LoggedIn({ children }: { children: ReactNode }) {
  const user = await getUserSession();

  return user ? <>{children}</> : null;
}
