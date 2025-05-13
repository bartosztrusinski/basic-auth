import { type ReactNode } from 'react';
import { auth, currentUser } from '@/auth/session';
import { SessionProvider } from '@/auth/providers/session-provider';
import { CurrentUserProvider } from '@/auth/providers/current-user-provider';

export async function AuthProvider({ children }: { children: ReactNode }) {
  const { userId, userRole, expirationTime } = await auth();
  const user = await currentUser();

  return (
    <SessionProvider
      initialAuth={
        userId
          ? { isLoggedIn: true, userId, userRole, expirationTime }
          : { isLoggedIn: false, userId: null, userRole: null, expirationTime: null }
      }
    >
      <CurrentUserProvider
        initialUser={user ? { id: user.id, email: user.email, name: user.name } : null}
      >
        {children}
      </CurrentUserProvider>
    </SessionProvider>
  );
}
