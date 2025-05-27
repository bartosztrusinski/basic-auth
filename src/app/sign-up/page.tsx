import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
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
        <ProviderButtons />
        <SignupForm />
      </Page>
    </>
  );
}
