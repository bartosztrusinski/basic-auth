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

const DisableTwoFactorForm = dynamic(
  () => import('./disable-two-factor-form').then((mod) => mod.DisableTwoFactorForm),
  {
    ssr: false,
    loading: () => (
      <ModalConfirmButton disabled className='btn-danger min-w-20'>
        <Spinner />
      </ModalConfirmButton>
    ),
  },
);

export function DisableTwoFactorModal() {
  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>
        Disable Two-Factor Authentication
      </ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Disable Two-Factor Authentication</h2>
          </ModalTitle>
          <ModalDescription>
            This action will disable two-factor authentication for your account.
          </ModalDescription>
          <ModalButtonsContainer>
            <DisableTwoFactorForm />
            <ModalCancelButton />
          </ModalButtonsContainer>
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
