import Link from 'next/link';
import { LoggedIn } from '@/components/auth/logged-in';
import { ReturnBack } from '@/components/auth/return-back';
import { SignupForm } from '@/components/signup-form';
import { Page } from '@/components/page';

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <>
      <LoggedIn>
        <ReturnBack searchParams={searchParams} />
      </LoggedIn>
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
    </>
  );
}
