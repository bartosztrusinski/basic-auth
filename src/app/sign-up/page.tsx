import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getUserSession } from '@/auth/session';
import { SignupForm } from '@/components/signup-form';
import { Page } from '@/components/page';

export default async function SignupPage() {
  const user = await getUserSession();

  if (user) {
    redirect('/');
  }

  return (
    <Page>
      <Page.Title>Sign Up</Page.Title>
      <Page.Description>
        Already have an account?{' '}
        <Link href='/log-in' className='text-teal-500 hover:underline'>
          Log in
        </Link>
      </Page.Description>
      <SignupForm />
    </Page>
  );
}
