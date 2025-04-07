'use client';

import { logOut } from '@/actions';
import { useAuth } from '@/auth/hooks/use-auth';

export function LogoutButton() {
  const { setAuth } = useAuth();

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await logOut();
    setAuth({ isLoggedIn: false });
  }

  return (
    <form onSubmit={handleSubmit}>
      <button>Log Out</button>
    </form>
  );
}
