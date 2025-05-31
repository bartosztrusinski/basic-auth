'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import {
  ClassyDialog,
  ClassyDialogDescription,
  ClassyDialogTitle,
} from '@/components/classy-dialog';
import { ConfirmForm } from '@/components/confirm-form';

export function DeleteUserButton() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <ClassyDialog trigger={<button className='btn btn-danger'>Delete Account</button>}>
      {(closeDialog) => (
        <>
          <ClassyDialogTitle>
            <h2>Delete Account</h2>
          </ClassyDialogTitle>
          <ClassyDialogDescription>
            <p>This action is irreversible and will delete all your data.</p>
          </ClassyDialogDescription>
          <ConfirmForm
            confirmText={isPending ? 'Deleting...' : 'Delete'}
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
