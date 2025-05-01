import { useContext } from 'react';
import { SessionContext } from '@/auth/providers/session-provider';

export function useAuth() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
