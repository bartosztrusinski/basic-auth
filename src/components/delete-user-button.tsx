'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';
import { ConfirmForm } from '@/components/confirm-form';

export function DeleteUserButton() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <ClassyDialog
      trigger={<button className='btn btn-danger'>Delete Account</button>}
      heading='Delete Account'
      description='This action is irreversible and will delete all your data.'
    >
      {(closeDialog) => (
        <ConfirmForm
          confirmText={isPending ? 'Deleting...' : 'Delete'}
          action={action}
          isPending={isPending}
          onCancel={closeDialog}
          className='btn-danger'
        />
      )}
    </ClassyDialog>
  );
}
