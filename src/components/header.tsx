import Link from 'next/link';
import Image from 'next/image';
import { AuthNav } from '@/components/auth-nav';

export function Header() {
  return (
    <header>
      <nav className='flex flex-wrap justify-between gap-x-6 gap-y-4 bg-zinc-800 p-4'>
        <ul className='flex items-center gap-5'>
          <li>
            <Link href='/' className='link block hover:no-underline'>
              <Image src='/logo.png' alt='App logo' width={32} height={32} />
            </Link>
          </li>
          <li>
            <Link href='/' className='link link-neutral'>
              Home
            </Link>
          </li>
          <li>
            <Link href='/about' className='link link-neutral'>
              About
            </Link>
          </li>
          <li>
            <Link href='/private' className='link link-neutral'>
              Private
            </Link>
          </li>
          <li>
            <Link href='/admin' className='link link-neutral'>
              Admin
            </Link>
          </li>
        </ul>
        <AuthNav />
      </nav>
    </header>
  );
}
