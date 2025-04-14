import { useContext } from 'react';
import { SessionContext } from '../components/session-provider';

export function useAuth() {
  const context = useContext(SessionContext);

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }

  return context;
}
