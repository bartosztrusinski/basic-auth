import { redirect } from 'next/navigation';
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
    // TODO
    redirect(`/resend-verification?redirect_reason=${encodeURIComponent('Missing token')}`);
  }

  return (
    <Page>
      <Page.Title>Verify Email</Page.Title>
      <Page.Description>Click the button below to verify your email address</Page.Description>
      <VerifyEmailForm token={token} />
    </Page>
  );
}
