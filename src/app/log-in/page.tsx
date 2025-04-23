import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { SignupLink } from '@/auth/components/auth-link';
import { RedirectReason } from '@/auth/components/redirect-reason';
import { ProviderButtons } from '@/auth/components/provider-buttons';
import { Page } from '@/components/page';
import { LoginForm } from '@/components/login-form';

// TODO search params message should be a code, show a message based on the reason code
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
          <SignupLink searchParams={searchParams} className='text-teal-500 hover:underline'>
            Sign up
          </SignupLink>
        </Page.Description>
        <RedirectReason searchParams={searchParams} />
        <ProviderButtons />
        <LoginForm />
      </Page>
    </>
  );
}
