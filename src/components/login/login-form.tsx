'use client';

import { useState } from 'react';
import Link from 'next/link';
import { TwoFactorRecoveryForm } from './two-factor-recovery-form';
import { TwoFactorVerificationForm } from './two-factor-verification-form';
import { CredentialsForm } from './credentials-form';

export function LoginForm() {
  const [twoFactorToken, setTwoFactorToken] = useState<string | null>(null);
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
          <span aria-hidden>←</span>
        </button>

        {isRecoveryMode ? (
          <TwoFactorRecoveryForm token={twoFactorToken} />
        ) : (
          <TwoFactorVerificationForm token={twoFactorToken} />
        )}

        <p className='text-neutral-400'>
          {isRecoveryMode ? 'Got access to Authenticator? ' : 'No access to Authenticator? '}
          <button className='link' onClick={toggleRecoveryMode}>
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
      <div className='text-neutral-400'>
        <p>
          Don&apos;t have an account?{' '}
          <Link href='/sign-up' className='link'>
            Sign up
          </Link>
        </p>
        <p>
          Didn&apos;t get verification email?{' '}
          <Link href='/resend-email' className='link'>
            Resend email
          </Link>
        </p>
      </div>
    </>
  );
}
