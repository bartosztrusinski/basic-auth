import { useContext } from 'react';
import { CurrentUserContext } from '@/auth/providers/current-user-provider';

export function useCurrentUser() {
  const context = useContext(CurrentUserContext);

  if (!context) {
    throw new Error('useCurrentUser must be used within AuthProvider');
  }

  return context;
}
