import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-zinc-900 text-zinc-50'>
        <nav className='bg-zinc-800 p-4 text-zinc-50'>
          <ul className='flex gap-8'>
            <li>
              <Link href='/'>Home</Link>
            </li>
            <li>
              <Link href='/login'>Login</Link>
            </li>
            <li>
              <Link href='/register'>Register</Link>
            </li>
            <li>
              <Link href='#'>Logout</Link>
            </li>
          </ul>
        </nav>
        <main className='mx-auto mt-4 w-full max-w-80 p-4'>{children}</main>
      </body>
    </html>
  );
}
