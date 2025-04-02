import { redirect, RedirectType } from 'next/navigation';
import { getUserSession } from '@/auth/session';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { callbackUrl } = await searchParams;
  const userSession = await getUserSession();

  if (userSession) {
    redirect(callbackUrl ? decodeURIComponent(callbackUrl) : '/', RedirectType.replace);
  }

  return (
    <>
      <h1 className='mb-6 text-3xl font-bold'>Log In</h1>
      <LoginForm />
    </>
  );
}
