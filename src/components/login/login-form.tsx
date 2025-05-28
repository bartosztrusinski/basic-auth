'use client';

import { useState } from 'react';
import Link from 'next/link';
import { type TwoFactorAttempt } from '@/db';
import { RecoveryCodeForm } from './recovery-code-form';
import { TwoFactorForm } from './two-factor-form';
import { CredentialsForm } from './credentials-form';

export function LoginForm() {
  const [twoFactorToken, setTwoFactorToken] = useState<TwoFactorAttempt['token'] | null>(null);
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  function goBack() {
    setTwoFactorToken(null);
    setIsRecoveryMode(false);
  }

  function toggleRecoveryMode() {
    setIsRecoveryMode((prev) => !prev);
  }

  if (twoFactorToken) {
    return (
      <>
        <button
          type='button'
          className='btn flex size-9 items-center justify-center font-bold'
          onClick={goBack}
        >
          <span className='sr-only'>Go back to credentials form</span>
          <span aria-hidden='true'>←</span>
        </button>

        {isRecoveryMode ? (
          <RecoveryCodeForm token={twoFactorToken} />
        ) : (
          <TwoFactorForm token={twoFactorToken} />
        )}

        <p className='text-zinc-400'>
          {isRecoveryMode ? 'Got access to Authenticator? ' : 'No access to Authenticator? '}
          <button
            className='rounded text-amber-500 outline-2 outline-offset-2 outline-amber-500 hover:underline focus-visible:outline'
            onClick={toggleRecoveryMode}
          >
            Enter {isRecoveryMode ? '2FA' : 'recovery'} code
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <CredentialsForm
        onSuccess={(data) => {
          setTwoFactorToken(data?.twoFactorToken ?? null);
        }}
      />
      <div className='text-zinc-400'>
        <p>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='text-amber-500 hover:underline'>
            Sign up
          </Link>
        </p>
        <p>
          Didn&apos;t get verification email?{' '}
          <Link href='/resend-email' className='text-amber-500 hover:underline'>
            Resend email
          </Link>
        </p>
      </div>
    </>
  );
}
