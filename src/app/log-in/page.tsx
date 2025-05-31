import { LoggedIn } from '@/auth/components/logged-in';
import { ReturnBack } from '@/auth/components/return-back';
import { getSearchParam } from '@/auth/util';
import config from '@/auth/config';
import { ProviderButtons } from '@/components/provider-buttons';
import { LoginForm } from '@/components/login/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const returnBackUrl = await getSearchParam(searchParams, config.returnBackUrlKey);

  return (
    <>
      <LoggedIn>
        <ReturnBack returnUrl={returnBackUrl} />
      </LoggedIn>
      <div className='container'>
        <h1 className='title'>Login</h1>
        <ProviderButtons redirectUrl={returnBackUrl} />
        <LoginForm />
      </div>
    </>
  );
}
