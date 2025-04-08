'use client';

import Link from 'next/link';
import { LoginLink, SignupLink } from '@/auth/components/auth-link';
import { useAuth } from '@/auth/hooks/use-auth';
import { LogoutButton } from '@/components/logout-button';

export function Header() {
  const { isLoggedIn } = useAuth();

  return (
    <nav className='flex flex-wrap justify-between gap-x-8 gap-y-4 bg-zinc-800 p-4 text-zinc-50'>
      <ul className='flex gap-8'>
        <li>
          <Link href='/'>Home</Link>
        </li>
        <li>
          <Link href='/about'>About</Link>
        </li>
        <li>
          <Link href='/private'>Private</Link>
        </li>
        <li>
          <Link href='/admin'>Admin</Link>
        </li>
      </ul>
      <ul className='flex gap-8'>
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
    </nav>
  );
}
