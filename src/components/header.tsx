'use client';

import Link from 'next/link';
// import { LoginLink, SignupLink } from '@/auth/components/auth-link';
import { LogoutButton } from '@/components/logout-button';
import { useAuth } from '@/auth/hooks/use-auth';

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
              {/* <LoginLink>Log In</LoginLink> */}
              <Link href='/log-in'>Log In</Link>
            </li>
            <li>
              {/* <SignupLink>Sign Up</SignupLink> */}
              <Link href='/sign-up'>Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
