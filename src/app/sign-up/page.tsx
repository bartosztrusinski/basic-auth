import { redirect } from 'next/navigation';
import { getUserFromSession } from '@/auth/session';
import { SignupForm } from '@/components/signup-form';

export default async function SignupPage() {
  const user = await getUserFromSession();

  if (user) {
    redirect('/');
  }

  return <SignupForm />;
}
