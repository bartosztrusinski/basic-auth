import { redirect } from 'next/navigation';
import { getSession } from '@/lib';
import { RegisterForm } from '@/components/register-form';

export default async function RegisterPage() {
  const session = await getSession();

  if (session) {
    redirect('/');
  }

  return <RegisterForm />;
}
