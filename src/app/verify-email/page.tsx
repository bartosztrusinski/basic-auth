import config from '@/auth/config';
import { redirectAuth } from '@/auth/util';
import { Page } from '@/components/page';
import { VerifyEmailForm } from '@/components/verify-email-form';

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const params = await searchParams;
  const { token } = params;

  if (!token) {
    redirectAuth(config.resendVerificationEmailRoute, {
      authCode: 'email-verification-failed',
    });
  }

  return (
    <Page>
      <Page.Title>Verify Email</Page.Title>
      <Page.Description>Click the button below to verify your email address</Page.Description>
      <VerifyEmailForm token={token} />
    </Page>
  );
}
