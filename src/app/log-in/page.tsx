import Link from 'next/link';
import { LoggedIn } from '@/components/auth/logged-in';
import { RedirectBack } from '@/components/auth/redirect-back';
import { LoginForm } from '@/components/login-form';
import { Page } from '@/components/page';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <>
      <LoggedIn>
        <RedirectBack callbackUrl={callbackUrl} />
      </LoggedIn>
      <Page>
        <Page.Title>Log In</Page.Title>
        <Page.Description>
          Don&apos;t have an account?{' '}
          <Link
            href={`/sign-up${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
            className='text-teal-500 hover:underline'
          >
            Sign up
          </Link>
        </Page.Description>
        <LoginForm />
      </Page>
    </>
  );
}
