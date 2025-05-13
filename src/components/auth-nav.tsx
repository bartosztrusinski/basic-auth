'use client';

import Link from 'next/link';
import { useAuth } from '@/auth/hooks/use-auth';
import { LoginLink, SignupLink } from '@/auth/components/auth-link';
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
            <LoginLink>Log In</LoginLink>
          </li>
          <li>
            <SignupLink>Sign Up</SignupLink>
          </li>
        </>
      )}
    </ul>
  );
}
