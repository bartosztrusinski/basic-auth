'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import { ModalConfirmButton } from '@/components/ui/classy-modal';

export function DeleteUserForm() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <form action={action}>
      <ModalConfirmButton disabled={isPending} className='btn-danger'>
        {isPending ? 'Deleting...' : 'Delete'}
      </ModalConfirmButton>
    </form>
  );
}
