import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import {
  ModalButtonsContainer,
  ModalCancelButton,
  ModalConfirmButton,
} from '@/components/classy-modal';

export function DeleteUserForm() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <form action={action}>
      <ModalButtonsContainer>
        <ModalConfirmButton disabled={isPending} className='btn-danger'>
          {isPending ? 'Deleting...' : 'Delete'}
        </ModalConfirmButton>
        <ModalCancelButton />
      </ModalButtonsContainer>
    </form>
  );
}
