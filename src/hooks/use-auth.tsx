'use client';

import {
  createContext,
  useContext,
  useState,
  type Dispatch,
  type ReactNode,
  type SetStateAction,
} from 'react';

const AuthContext = createContext<{
  accessToken: string | null;
  setAccessToken: Dispatch<SetStateAction<string | null>>;
}>({
  accessToken: null,
  setAccessToken: () => null,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  return (
    <AuthContext.Provider value={{ accessToken, setAccessToken }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
