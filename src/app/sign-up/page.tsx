import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { OAuthLoginButtons } from '@/components/oauth';
import { SignupForm } from '@/components/signup-form';

export const metadata = {
  title: 'Signup',
  description: 'Create a new account to access protected resources',
};

export default async function SignupPage() {
  return (
    <>
      <LoggedIn>
        <ReturnBack />
      </LoggedIn>
      <div className='container'>
        <h1 className='title'>Signup</h1>
        <OAuthLoginButtons />
        <SignupForm />
      </div>
    </>
  );
}
