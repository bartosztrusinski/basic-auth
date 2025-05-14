'use client';

import { useActionState } from 'react';
import { initiateTwoFactorAuth } from '@/actions';
import { Dialog } from '@/components/dialog';
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

      {/* TODO fix rendering */}
      {state.isSuccess && (
        <Dialog trigger={state.isSuccess} onClose={handleClose}>
          {(closeDialog) => {
            return (
              <div className='flex max-w-sm flex-col gap-2 rounded-md border border-zinc-700 bg-zinc-900 p-4 text-zinc-50'>
                <button
                  onClick={closeDialog}
                  className='absolute right-2 top-2 size-7 rounded bg-red-500 bg-opacity-0 text-red-500 transition-opacity duration-100 hover:bg-opacity-20'
                >
                  ⨉
                </button>
                <h2 className='pr-5 font-medium'>Enable Two-Factor Authentication</h2>
                <p className='text-sm text-zinc-400'>
                  Scan the QR code below with your authenticator app or enter the code manually to
                  set up two-factor authentication.
                </p>
                <EnableTwoFactorForm secret={state.secret} qrCode={state.qrCode} />
              </div>
            );
          }}
        </Dialog>
      )}
    </>
  );
}
