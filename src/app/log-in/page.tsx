import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import { getUserSession } from '@/auth/session';
import { LoginForm } from '@/components/login-form';
import { Page } from '@/components/page';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { callbackUrl } = await searchParams;
  const userSession = await getUserSession();

  if (userSession) {
    redirect(callbackUrl ? decodeURIComponent(callbackUrl) : '/', RedirectType.replace);
  }

  return (
    <Page>
      <Page.Title>Log In</Page.Title>
      <Page.Description>
        Don&apos;t have an account?{' '}
        <Link href='/sign-up' className='text-teal-500 hover:underline'>
          Sign up
        </Link>
      </Page.Description>
      <LoginForm />
    </Page>
  );
}
