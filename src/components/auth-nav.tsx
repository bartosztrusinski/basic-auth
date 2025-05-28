'use client';

import { useAuth } from '@/auth/hooks/use-auth';
import config from '@/auth/config';
import { NavLink } from '@/components/nav-link';
import { LogoutButton } from '@/components/logout-button';

export function AuthNav() {
  const { isLoggedIn } = useAuth();

  return (
    <ul className='flex items-center gap-5'>
      {isLoggedIn ? (
        <>
          <li>
            <NavLink href='/profile'>Profile</NavLink>
          </li>
          <li>
            <LogoutButton />
          </li>
        </>
      ) : (
        <>
          <li>
            <NavLink href={config.loginRoute}>Log In</NavLink>
          </li>
          <li>
            <NavLink href='/sign-up'>Sign Up</NavLink>
          </li>
        </>
      )}
    </ul>
  );
}
