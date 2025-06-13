import { type ReactNode } from 'react';
import { auth, currentUser } from '@/auth/session';
import { SessionProvider } from '@/auth/providers/session-provider';
import { CurrentUserProvider } from '@/auth/providers/current-user-provider';

export async function AuthProvider({ children }: { children: ReactNode }) {
  const { userId, userRole, expiresAt } = await auth();
  const user = await currentUser();

  return (
    <SessionProvider
      initialAuth={
        userId
          ? { isLoggedIn: true, userId, userRole, expiresAt }
          : { isLoggedIn: false, userId: null, userRole: null, expiresAt: null }
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
