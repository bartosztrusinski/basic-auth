import { redirect } from 'next/navigation';
import { getUserSession } from '@/auth/session';
import { SignupForm } from '@/components/signup-form';

export default async function SignupPage() {
  const user = await getUserSession();

  if (user) {
    redirect('/');
  }

  return (
    <>
      <h1 className='mb-6 text-3xl font-bold'>Sign Up</h1>
      <SignupForm />
    </>
  );
}
