import Link from 'next/link';
import config from '@/auth/config';
import { getAuthCode, getAuthMessage } from '@/auth/message';
import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { SignupLink } from '@/auth/components/auth-link';
import { ProviderButtons } from '@/auth/components/provider-buttons';
import { Page } from '@/components/page';
import { LoginForm } from '@/components/login-form';
import { Alert } from '@/components/alert';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const authCode = await getAuthCode(searchParams);
  const authMessage = authCode ? getAuthMessage(authCode) : null;

  return (
    <>
      <LoggedIn>
        <ReturnBack searchParams={searchParams} />
      </LoggedIn>
      <Page>
        <Page.Title>Login</Page.Title>
        <Page.Description>
          Don&apos;t have an account?{' '}
          <SignupLink searchParams={searchParams} className='text-teal-500 hover:underline'>
            Sign up
          </SignupLink>
          <br />
          Verification email did not arrive?{' '}
          <Link
            href={config.resendVerificationEmailRoute}
            className='text-teal-500 hover:underline'
          >
            Resend email
          </Link>
        </Page.Description>
        {authMessage && <Alert variant={authMessage.type} message={authMessage.message} />}
        <ProviderButtons />
        <LoginForm />
      </Page>
    </>
  );
}
