'use client';

import dynamic from 'next/dynamic';
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
import { Spinner } from '@/components/ui/spinner';

const DeleteUserForm = dynamic(
  () => import('./delete-user-form').then((module) => module.DeleteUserForm),
  {
    ssr: false,
    loading: () => (
      <ModalConfirmButton disabled className='btn-danger min-w-20'>
        <Spinner />
      </ModalConfirmButton>
    ),
  },
);

export function DeleteUserModal() {
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
          <ModalButtonsContainer>
            <DeleteUserForm />
            <ModalCancelButton />
          </ModalButtonsContainer>
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
