import Link from 'next/link';
import Image from 'next/image';
import { AuthNav } from '@/components/auth-nav';
import { NavLink } from '@/components/nav-link';

type Route = {
  href: string;
  name: string;
};

const links: Route[] = [
  {
    href: '/',
    name: 'Home',
  },
  {
    href: '/about',
    name: 'About',
  },
  {
    href: '/private',
    name: 'Private',
  },
  {
    href: '/admin',
    name: 'Admin',
  },
];

export function Header() {
  return (
    <header>
      <nav className='flex flex-wrap justify-between gap-3 bg-neutral-800 p-3 sm:px-6 sm:py-4'>
        <ul className='flex items-center gap-4 sm:gap-6'>
          <li className='shrink-0'>
            <Link href='/' className='link hover:no-underline'>
              <Image src='/logo.png' alt='App logo' width={32} height={32} />
            </Link>
          </li>

          {links.map((link) => (
            <li key={link.href}>
              <NavLink href={link.href}>{link.name}</NavLink>
            </li>
          ))}
        </ul>
        <AuthNav />
      </nav>
    </header>
  );
}
