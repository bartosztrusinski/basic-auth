import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { ResendEmailForm } from '@/components/resend-email-form';

export const metadata = {
  title: 'Resend Email',
  description: 'Resend verification email to your registered email address',
};

export default async function ResendEmailPage() {
  return (
    <>
      <LoggedIn>
        <ReturnBack />
      </LoggedIn>
      <div className='container'>
        <h1 className='title'>Resend Email</h1>
        <p className='text-center'>
          Enter your email address and we will send you a new verification email.
        </p>
        <ResendEmailForm />
      </div>
    </>
  );
}
