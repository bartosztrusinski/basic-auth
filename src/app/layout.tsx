import Link from 'next/link';
import { type Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { LogoutButton } from '@/components/logout-button';
import { getSession } from '@/lib';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const session = await getSession();

  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-zinc-900 text-zinc-50'>
        <nav className='flex justify-between gap-4 bg-zinc-800 px-8 py-4 text-zinc-50'>
          <ul className='flex gap-8'>
            <li>
              <Link href='/'>Home</Link>
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
        <main className='mx-auto mt-4 w-full max-w-80 p-4'>{children}</main>
      </body>
    </html>
  );
}
