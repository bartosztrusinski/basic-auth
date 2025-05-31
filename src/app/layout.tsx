import { type ReactNode } from 'react';
import { type Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import '@/globals.css';
import { Header } from '@/components/header';
import { AuthToaster } from '@/components/auth-toaster';
import { AuthProvider } from '@/auth/providers/auth-provider';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang='en'
      className={`bg-neutral-900 text-neutral-50 selection:bg-primary-500 selection:text-neutral-950 ${GeistSans.variable} [&:has(dialog[open])]:overflow-hidden`}
    >
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
        <AuthToaster />
      </body>
    </html>
  );
}
