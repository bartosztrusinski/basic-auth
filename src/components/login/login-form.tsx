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
        className='size-10 rounded bg-zinc-800 shadow outline-current focus-visible:outline-2'
        onClick={goBack}
      >
        ←<label className='sr-only'>Go back to credentials form</label>
      </button>

      {isRecoveryMode ? (
        <RecoveryCodeForm token={twoFactorToken} />
      ) : (
        <TwoFactorForm token={twoFactorToken} />
      )}

      <span className='text-balance text-sm text-zinc-400'>
        {isRecoveryMode ? 'Want to enter Code from Authenticator? ' : 'Want to use Recovery Code? '}
        <span className='whitespace-nowrap'>
          Click{' '}
          <button
            type='button'
            className='py-2 text-amber-500 hover:underline'
            onClick={toggleRecoveryMode}
          >
            here
          </button>
        </span>
      </span>
    </>
  );
}
