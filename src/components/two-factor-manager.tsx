'use client';

import { useActionState } from 'react';
import { initiateTwoFactorAuth } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';
import { EnableTwoFactorForm } from '@/components/enable-two-factor-form';

export function TwoFactorManager() {
  const [state, action, isPending] = useActionState(initiateTwoFactorAuth, {
    isSuccess: false,
  });

  function handleClose() {
    state.isSuccess = false;
  }

  return (
    <>
      <form action={action}>
        <button disabled={isPending} className='w-full rounded border border-zinc-500 p-2'>
          {isPending ? 'Enabling...' : 'Enable Two-Factor Authentication'}
        </button>
      </form>

      <ClassyDialog
        trigger={state.isSuccess}
        onClose={handleClose}
        shouldCloseOnBackdropClick={false}
        heading='Enable Two-Factor Authentication'
        description='Scan the QR code below with your authenticator app or enter the code manually to set up two-factor authentication.'
      >
        {state.isSuccess && <EnableTwoFactorForm secret={state.secret} qrCode={state.qrCode} />}
      </ClassyDialog>
    </>
  );
}
