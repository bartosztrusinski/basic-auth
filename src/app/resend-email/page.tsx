import { LoggedIn } from '@/auth/components/logged-in';
import { RedirectReason } from '@/auth/components/redirect-reason';
import { ReturnBack } from '@/auth/components/return-back';
import { Page } from '@/components/page';
import { ResendEmailForm } from '@/components/resend-email-form';

export default async function ResendEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
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
        <RedirectReason searchParams={searchParams} />
        <ResendEmailForm />
      </Page>
    </>
  );
}
