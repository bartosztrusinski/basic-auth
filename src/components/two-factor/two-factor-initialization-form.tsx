'use client';

import { useActionState, useEffect } from 'react';
import { initializeTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/ui/alert';
import { type TwoFactorSetupState } from './types';

type Props = {
  onSuccess?: (data: Partial<TwoFactorSetupState>) => void;
};

export function TwoFactorInitializationForm({ onSuccess }: Props) {
  const [state, action, isPending] = useActionState(initializeTwoFactorAuth, {
    isSuccess: false,
  });

  useEffect(() => {
    if (state.isSuccess) {
      onSuccess?.(state);
    }
  }, [state, onSuccess]);

  return (
    <form action={action} className='space-y-3'>
      {state.errors && <Alert variant='error' message={state.errors} />}
      <button disabled={isPending} className='btn text-sm'>
        {isPending ? 'Initiating...' : 'Continue'}
      </button>
    </form>
  );
}
