'use client';

import { useActionState, useEffect } from 'react';
import { initializeTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/alert';
import { type TwoFactorData } from '@/components/enable-two-factor';

type Props = {
  onSuccess?: (data: Partial<TwoFactorData>) => void;
};

export function InitializeTwoFactorForm({ onSuccess }: Props) {
  const [state, action, isPending] = useActionState(initializeTwoFactorAuth, {
    isSuccess: false,
  });

  useEffect(() => {
    if (state.isSuccess) {
      const { qrCode, secret } = state;
      onSuccess?.({ qrCode, secret });
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className='space-y-2'>
      {state.errors && <Alert variant='error' message={state.errors} />}
      <button
        disabled={isPending}
        className='w-full rounded border border-zinc-700 p-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
      >
        {isPending ? 'Initiating...' : 'Continue'}
      </button>
    </form>
  );
}
