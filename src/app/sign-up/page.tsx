import { LoggedIn } from '@/components/auth/logged-in';
import { ReturnBack } from '@/components/auth/return-back';
import { LoginLink } from '@/components/auth/auth-link';
import { Page } from '@/components/page';
import { SignupForm } from '@/components/signup-form';

export default async function SignupPage({
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
        <Page.Title>Signup</Page.Title>
        <Page.Description>
          Already have an account?{' '}
          <LoginLink searchParams={searchParams} className='text-teal-500 hover:underline'>
            Log in
          </LoginLink>
        </Page.Description>
        <SignupForm />
      </Page>
    </>
  );
}
