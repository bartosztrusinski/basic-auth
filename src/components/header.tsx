import Link from 'next/link';
import Image from 'next/image';
import { AuthNav } from '@/components/auth-nav';

export function Header() {
  return (
    <header>
      <nav className='flex flex-wrap justify-between gap-x-6 gap-y-4 bg-zinc-800 p-4'>
        <ul className='flex items-center gap-5'>
          <li>
            <Link href='/'>
              <Image src='/logo.png' alt='App logo' width={32} height={32} />
            </Link>
          </li>
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
        <AuthNav />
      </nav>
    </header>
  );
}
