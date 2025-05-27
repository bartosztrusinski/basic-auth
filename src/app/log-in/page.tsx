import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { ProviderButtons } from '@/components/provider-buttons';
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
      <div className='container'>
        <h1 className='title'>Login</h1>
        <ProviderButtons />
        <LoginForm />
      </div>
    </>
  );
}
