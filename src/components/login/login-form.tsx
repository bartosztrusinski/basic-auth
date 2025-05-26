'use client';

import { useState } from 'react';
import { type TwoFactorAttempt } from '@/db';
import { RecoveryCodeForm } from './recovery-code-form';
import { TwoFactorForm } from './two-factor-form';
import { CredentialsForm } from '@/components/login/credentials-form';

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
      <CredentialsForm
        onSuccess={(data) => {
          setTwoFactorToken(data?.twoFactorToken ?? null);
        }}
      />
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

      <div>
        {isRecoveryMode ? (
          <RecoveryCodeForm token={twoFactorToken} />
        ) : (
          <TwoFactorForm token={twoFactorToken} />
        )}

        <div className='mt-2 text-sm'>
          {isRecoveryMode ? 'Got access to Authenticator? ' : 'Lost access to Authenticator? '}
          <button
            type='button'
            className='text-amber-500 hover:underline'
            onClick={toggleRecoveryMode}
          >
            Enter {isRecoveryMode ? '' : 'recovery'} code
          </button>
        </div>
      </div>
    </>
  );
}
