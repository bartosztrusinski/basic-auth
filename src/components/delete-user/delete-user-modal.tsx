'use client';

import { useActionState } from 'react';
import { deleteCurrentUser } from '@/actions';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalContainer,
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
  ModalButtonsContainer,
  ModalCancelButton,
  ModalConfirmButton,
} from '@/components/ui/classy-modal';

export function DeleteUserModal() {
  const [, action, isPending] = useActionState(deleteCurrentUser, null);

  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>Delete Account</ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Delete Account</h2>
          </ModalTitle>
          <ModalDescription>
            This action is irreversible and will delete all your data.
          </ModalDescription>
          <form action={action}>
            <ModalButtonsContainer>
              <ModalConfirmButton disabled={isPending} className='btn-danger'>
                {isPending ? 'Deleting...' : 'Delete'}
              </ModalConfirmButton>
              <ModalCancelButton />
            </ModalButtonsContainer>
          </form>
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
