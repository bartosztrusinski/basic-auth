'use client';

import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCloseButton, ModalContainer } from '@/components/ui/classy-modal';
import { EnableTwoFactorForm } from './enable-two-factor-form';

export function EnableTwoFactorModal() {
  return (
    <Modal>
      <ModalOpenButton>
        <button className='btn'>Enable Two-Factor Authentication</button>
      </ModalOpenButton>
      <ModalContent shouldCloseOnBackdropClick={false}>
        <ModalContainer>
          <EnableTwoFactorForm />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
