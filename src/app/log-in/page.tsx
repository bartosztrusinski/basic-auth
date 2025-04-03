import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { SignupLink } from '@/auth/components/auth-link';
import { Page } from '@/components/page';
import { LoginForm } from '@/components/login-form';

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
        <LoginForm />
      </Page>
    </>
  );
}
