'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';

export function LogoutEverywhereButton() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <ClassyDialog
      trigger={
        <button className='w-full rounded bg-red-600 p-4 py-2 shadow-lg shadow-red-900 disabled:cursor-not-allowed disabled:opacity-50'>
          Log Out Everywhere
        </button>
      }
      heading='Log Out Everywhere'
      description='This action will log you out of all devices and sessions.'
    >
      {(closeDialog) => (
        <form action={action} className='flex items-end justify-end gap-2'>
          <button
            type='submit'
            disabled={isPending}
            className='rounded bg-red-600 p-4 py-1 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Logging out...' : 'Log Out'}
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
