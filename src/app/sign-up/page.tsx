import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { LoginLink } from '@/auth/components/auth-link';
import { ProviderButtons } from '@/components/provider-buttons';
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
          <LoginLink searchParams={searchParams} className='text-amber-500 hover:underline'>
            Log in
          </LoginLink>
        </Page.Description>
        <ProviderButtons />
        <SignupForm />
      </Page>
    </>
  );
}
