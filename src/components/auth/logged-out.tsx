import { type ReactNode } from 'react';
import { getUserSession } from '@/auth/session';

export async function LoggedOut({ children }: { children: ReactNode }) {
  const user = await getUserSession();

  return user ? null : <>{children}</>;
}
