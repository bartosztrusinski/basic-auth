import Link from 'next/link';
import { redirect, RedirectType } from 'next/navigation';
import { getUserSession } from '@/auth/session';
import { SignupForm } from '@/components/signup-form';
import { Page } from '@/components/page';

export default async function SignupPage({
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
    <Page>
      <Page.Title>Sign Up</Page.Title>
      <Page.Description>
        Already have an account?{' '}
        <Link
          href={`/log-in${callbackUrl ? `?callbackUrl=${encodeURIComponent(callbackUrl)}` : ''}`}
          className='text-teal-500 hover:underline'
        >
          Log in
        </Link>
      </Page.Description>
      <SignupForm />
    </Page>
  );
}
