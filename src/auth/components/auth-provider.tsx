import { type ReactNode } from 'react';
import { auth } from '../session';
import { ClientAuthProvider } from './client-auth-provider';

export async function AuthProvider({ children }: { children: ReactNode }) {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  return (
    <ClientAuthProvider initialAuth={{ isLoggedIn, userId, userRole, expirationTime }}>
      {children}
    </ClientAuthProvider>
  );
}
