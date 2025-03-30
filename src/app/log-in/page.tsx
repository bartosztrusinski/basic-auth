import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/auth/session';
import { LoginForm } from '@/components/login-form';

export default async function LoginPage() {
  const user = await getUserFromSession();

  if (user) {
    redirect('/');
  }

  return (
    <>
      <h1 className='mb-6 text-3xl font-bold'>Log In</h1>
      <LoginForm />
    </>
  );
}
