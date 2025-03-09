import '@/styles/globals.css';

import { GeistSans } from 'geist/font/sans';
import { type Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Basic Auth',
  description: 'Next.js app presenting basic user authentication and authorization',
  icons: [{ rel: 'icon', url: '/favicon.ico' }],
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang='en' className={`${GeistSans.variable}`}>
      <body className='bg-zinc-900 text-zinc-50'>{children}</body>
    </html>
  );
}
