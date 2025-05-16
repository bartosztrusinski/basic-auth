'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';

export function DeleteUserButton() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <ClassyDialog
      trigger={
        <button className='w-full rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'>
          Delete Account
        </button>
      }
      heading='Delete Account'
      description='This action is irreversible and will delete all your data.'
    >
      {(closeDialog) => (
        <form action={action} className='flex items-end justify-end gap-2'>
          <button
            type='submit'
            disabled={isPending}
            className='rounded bg-red-600 p-4 py-1 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Deleting...' : 'Delete'}
          </button>
          <button
            type='button'
            onClick={closeDialog}
            className='rounded border border-zinc-700 p-4 py-1 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            Cancel
          </button>
        </form>
      )}
    </ClassyDialog>
  );
}
