'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/hooks/use-auth';
import config from '@/auth/config';
import { LogoutButton } from '@/components/logout-button';

export function AuthNav() {
  const { isLoggedIn } = useAuth();

  return (
    <ul className='flex items-center gap-5'>
      {isLoggedIn ? (
        <>
          <li>
            <Link href='/profile'>Profile</Link>
          </li>
          <li>
            <LogoutButton />
          </li>
        </>
      ) : (
        <>
          <li>
            <Link href={config.loginRoute}>Log In</Link>
          </li>
          <li>
            <Link href='/sign-up'>Sign Up</Link>
          </li>
        </>
      )}
    </ul>
  );
}
