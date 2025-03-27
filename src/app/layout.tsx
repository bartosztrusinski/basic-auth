import { type Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { AuthProvider } from '@/hooks/use-auth';
import { Header } from '@/components/header';
import '@/globals.css';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default async function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-zinc-900 text-zinc-50'>
        <AuthProvider>
          <Header />
          <main className='mx-auto mt-4 w-full max-w-80 p-4'>{children}</main>
        </AuthProvider>
      </body>
    </html>
  );
}
