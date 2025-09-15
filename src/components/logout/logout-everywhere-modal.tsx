'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalCloseButton,
  ModalContainer,
  ModalDescription,
  ModalTitle,
  ModalButtonsContainer,
  ModalConfirmButton,
  ModalCancelButton,
} from '@/components/ui/classy-modal';
import { Spinner } from '@/components/ui/spinner';

const LogoutEverywhereForm = dynamic(
  () => import('./logout-everywhere-form').then((module) => module.LogoutEverywhereForm),
  {
    ssr: false,
    loading: () => (
      <ModalConfirmButton disabled className='btn-danger min-w-20'>
        <Spinner />
      </ModalConfirmButton>
    ),
  },
);

export function LogoutEverywhereModal() {
  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>Log Out Everywhere</ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Log Out Everywhere</h2>
          </ModalTitle>
          <ModalDescription>
            This action will log you out of all devices and sessions.
          </ModalDescription>
          <ModalButtonsContainer>
            <LogoutEverywhereForm />
            <ModalCancelButton />
          </ModalButtonsContainer>
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
