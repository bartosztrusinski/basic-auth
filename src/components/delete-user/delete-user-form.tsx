'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';

export function DeleteUserForm() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <form action={action}>
      <button disabled={isPending} type='submit' className='btn btn-inline btn-danger'>
        {isPending ? 'Deleting...' : 'Delete'}
      </button>
    </form>
  );
}
