import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { ProviderButtons } from '@/components/provider-buttons';
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
      <div className='container'>
        <h1 className='title'>Signup</h1>
        <ProviderButtons />
        <SignupForm />
      </div>
    </>
  );
}
