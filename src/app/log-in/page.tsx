import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { ProviderButtons } from '@/components/provider-buttons';
import { Page } from '@/components/page';
import { LoginForm } from '@/components/login/login-form';

export default async function LoginPage({
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
        <Page.Title>Login</Page.Title>
        <ProviderButtons />
        <LoginForm />
      </Page>
    </>
  );
}
