import { redirectAuth } from '@/auth/util';
import { VerifyEmailForm } from '@/components/verify-email-form';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { token } = params;

  if (!token) {
    redirectAuth('/resend-email', {
      authCode: 'email-verification-failed',
    });
  }

  return (
    <div className='container'>
      <h1 className='title'>Verify Email</h1>
      <p className='text-center'>Click the button below to verify your email address</p>
      <VerifyEmailForm token={token} />
    </div>
  );
}
