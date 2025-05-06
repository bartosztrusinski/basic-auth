'use client';

import { useActionState } from 'react';
import { deleteUser } from '@/auth/actions';
import { Dialog } from '@/components/dialog';

export function DeleteUserButton() {
  const [, action, isPending] = useActionState(deleteUser, null);

  return (
    <Dialog
      trigger={
        <button className='w-full rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'>
          Delete Account
        </button>
      }
    >
      {(closeDialog) => {
        return (
          <div className='flex max-w-sm flex-col gap-1 rounded-md border border-zinc-600 bg-zinc-900 p-4 text-zinc-50'>
            <button
              onClick={closeDialog}
              className='absolute right-3 top-3 size-7 rounded bg-red-500 bg-opacity-0 text-red-500 transition-opacity duration-100 hover:bg-opacity-20'
            >
              ⨉
            </button>
            <h2 className='text-base font-semibold'>Delete Account</h2>
            <p className='text-zinc-400'>
              This action is irreversible and will delete all your data.
            </p>
            <form action={action} className='text-end'>
              <button
                disabled={isPending}
                className='rounded bg-red-600 p-4 py-1 shadow disabled:cursor-not-allowed disabled:opacity-50'
              >
                {isPending ? 'Deleting...' : 'Delete'}
              </button>
            </form>
          </div>
        );
      }}
    </Dialog>
  );
}
