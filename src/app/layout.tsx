import { type ReactNode } from 'react';
import { type Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/globals.css';
import { Header } from '@/components/header';
import { AuthProvider } from '@/auth/components/auth-provider';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-zinc-900 text-zinc-50'>
        <AuthProvider>
          <Header />
          <main className='mx-auto mt-4 w-full max-w-sm p-4'>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
