import { type ReactNode } from 'react';
import { auth, currentUser } from '@/auth/session';
import { SessionProvider } from '@/auth/providers/session-provider';
import { CurrentUserProvider } from '@/auth/providers/current-user-provider';

export async function AuthProvider({ children }: { children: ReactNode }) {
  const { userId, userRole, expirationTime } = await auth();
  const user = await currentUser();
  const isLoggedIn = Boolean(userId);
  const initialUser = user
    ? {
        id: user.id,
        email: user.email,
        name: user.name,
        hasPassword: user.hasPassword,
      }
    : null;

  return (
    <SessionProvider initialAuth={{ isLoggedIn, userId, userRole, expirationTime }}>
      <CurrentUserProvider initialUser={initialUser}>{children}</CurrentUserProvider>
    </SessionProvider>
  );
}
