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
      <nav className='flex flex-wrap justify-between gap-x-6 gap-y-4 bg-neutral-800 p-4'>
        <ul className='flex items-center gap-5'>
          <li>
            <Link href='/' className='link block hover:no-underline'>
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
