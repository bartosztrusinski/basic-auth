'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';
import { ConfirmForm } from '@/components/confirm-form';

export function LogoutEverywhereButton() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <ClassyDialog
      trigger={<button className='btn btn-danger'>Log Out Everywhere</button>}
      heading='Log Out Everywhere'
      description='This action will log you out of all devices and sessions.'
    >
      {(closeDialog) => (
        <ConfirmForm
          confirmText={isPending ? 'Logging out...' : 'Log Out'}
          action={action}
          isPending={isPending}
          onCancel={closeDialog}
          className='btn-danger'
        />
      )}
    </ClassyDialog>
  );
}
