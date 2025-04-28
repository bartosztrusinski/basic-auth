import { getAuthCode, getAuthMessage } from '@/auth/message';
import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { Alert } from '@/components/alert';
import { Page } from '@/components/page';
import { ResendEmailForm } from '@/components/resend-email-form';

export default async function ResendEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const authCode = await getAuthCode(searchParams);
  const authMessage = authCode ? getAuthMessage(authCode) : null;

  return (
    <>
      <LoggedIn>
        <ReturnBack />
      </LoggedIn>
      <Page>
        <Page.Title>Resend Email</Page.Title>
        <Page.Description>
          Enter your email address and we will send you a new verification email.
        </Page.Description>
        {authMessage && <Alert variant={authMessage.type} message={authMessage.message} />}
        <ResendEmailForm />
      </Page>
    </>
  );
}
