import { getAuthCode } from '@/auth/message';
import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { Page } from '@/components/page';
import { ResendEmailForm } from '@/components/resend-email-form';
import { AuthAlert } from '@/components/auth-alert';

export default async function ResendEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const authCode = await getAuthCode(searchParams);

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
        <AuthAlert authCode={authCode} />
        <ResendEmailForm />
      </Page>
    </>
  );
}
