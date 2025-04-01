import Link from 'next/link';
import { getUserSession } from '@/auth/session';
import { LogoutButton } from '@/components/logout-button';

export async function Header() {
  const user = await getUserSession();

  return (
    <nav className='flex items-center justify-between gap-4 bg-zinc-800 px-8 py-4 text-zinc-50'>
      <ul className='flex gap-8'>
        <li>
          <Link href='/'>Home</Link>
        </li>
      </ul>
      <ul className='flex gap-8'>
        {user ? (
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
              <Link href='/log-in'>Log In</Link>
            </li>
            <li>
              <Link href='/sign-up'>Sign Up</Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
