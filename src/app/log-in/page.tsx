import Link from 'next/link';
import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { SignupLink } from '@/auth/components/auth-link';
import { ProviderButtons } from '@/components/provider-buttons';
import { Page } from '@/components/page';
import { LoginForm } from '@/components/login/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  return (
    <>
      <LoggedIn>
        <ReturnBack searchParams={searchParams} />
      </LoggedIn>
      <Page>
        <Page.Title>Login</Page.Title>
        <Page.Description>
          Don&apos;t have an account?{' '}
          <SignupLink searchParams={searchParams} className='text-amber-500 hover:underline'>
            Sign up
          </SignupLink>
          <br />
          Didn&apos;t get verification email?{' '}
          <Link href='/resend-email' className='text-amber-500 hover:underline'>
            Resend email
          </Link>
        </Page.Description>
        <ProviderButtons />
        <LoginForm />
      </Page>
    </>
  );
}
