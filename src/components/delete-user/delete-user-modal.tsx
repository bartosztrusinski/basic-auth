'use client';

import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalContainer,
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
} from '@/components/ui/classy-modal';
import { DeleteUserForm } from './delete-user-form';

export function DeleteUserModal() {
  return (
    <Modal>
      <ModalOpenButton>
        <button className='btn btn-danger'>Delete Account</button>
      </ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Delete Account</h2>
          </ModalTitle>
          <ModalDescription>
            This action is irreversible and will delete all your data.
          </ModalDescription>
          <DeleteUserForm />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
