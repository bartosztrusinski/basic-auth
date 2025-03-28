import Link from 'next/link';
import { auth } from '@/auth';
import { LogoutButton } from '@/components/logout-button';

export async function Header() {
  const session = await auth();

  return (
    <header>
      <nav className='flex justify-between gap-4 bg-zinc-800 px-8 py-4 text-zinc-50'>
        <ul className='flex gap-8'>
          <li>
            <Link href='/'>Home</Link>
          </li>
          <li>
            <Link href='/about'>About</Link>
          </li>
        </ul>
        <ul className='flex gap-8'>
          {session ? (
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
                <Link href='/login'>Log In</Link>
              </li>
              <li>
                <Link href='/register'>Sign Up</Link>
              </li>
            </>
          )}
        </ul>
      </nav>
    </header>
  );
}
