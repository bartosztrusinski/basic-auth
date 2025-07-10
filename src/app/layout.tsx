import { Suspense, type ReactNode } from 'react';
import { GeistSans } from 'geist/font/sans';
import '@/globals.css';
import { AuthProvider } from '@/auth/providers/auth-provider';
import config from '@/auth/config';
import { Header } from '@/components/header';
import { AuthToaster } from '@/components/auth-toaster';

export const metadata = {
  title: {
    default: config.appName,
    template: `%s | ${config.appName}`,
  },
  applicationName: config.appName,
  description:
    'Next.js app implementing user authentication and authorization, role-based access control, email verification, OAuth provider integration, Two-Factor authentication, user management and more',
  keywords: [
    'Next.js',
    'React',
    'Authentication',
    'Authorization',
    'Role-based Access Control',
    'OAuth',
    'Two-Factor Authentication',
    'User Management',
    'Email Verification',
  ],
};

export default async function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html
      lang='en'
      className={`bg-neutral-900 text-neutral-50 selection:bg-primary-500 selection:text-neutral-950 [&:has(dialog[open])]:overflow-hidden ${GeistSans.variable}`}
    >
      <body>
        <AuthProvider>
          <Header />
          <main>{children}</main>
        </AuthProvider>
        <Suspense>
          <AuthToaster />
        </Suspense>
      </body>
    </html>
  );
}
