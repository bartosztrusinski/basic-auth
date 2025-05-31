'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
import {
  ClassyDialog,
  ClassyDialogDescription,
  ClassyDialogTitle,
} from '@/components/classy-dialog';
import { ConfirmForm } from '@/components/confirm-form';

export function LogoutEverywhereButton() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <ClassyDialog trigger={<button className='btn btn-danger'>Log Out Everywhere</button>}>
      {(closeDialog) => (
        <>
          <ClassyDialogTitle>
            <h2>Log Out Everywhere</h2>
          </ClassyDialogTitle>
          <ClassyDialogDescription>
            <p>This action will log you out of all devices and sessions.</p>
          </ClassyDialogDescription>
          <ConfirmForm
            confirmText={isPending ? 'Logging out...' : 'Log Out'}
            action={action}
            isPending={isPending}
            onCancel={closeDialog}
            className='btn-danger'
          />
        </>
      )}
    </ClassyDialog>
  );
}
