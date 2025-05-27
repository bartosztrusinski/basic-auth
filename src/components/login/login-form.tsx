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

  if (!twoFactorToken) {
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

  return (
    <>
      <button
        type='button'
        className='size-9 rounded bg-zinc-800 shadow outline-current focus-visible:outline-2'
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
        <button className='text-amber-500 hover:underline' onClick={toggleRecoveryMode}>
          Enter {isRecoveryMode ? '2FA' : 'recovery'} code
        </button>
      </p>
    </>
  );
}
