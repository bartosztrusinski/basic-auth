'use client';

import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalCloseButton,
  ModalContainer,
  ModalDescription,
  ModalTitle,
} from '@/components/ui/classy-modal';
import { DisableTwoFactorForm } from './disable-two-factor-form';

export function DisableTwoFactorModal() {
  return (
    <Modal>
      <ModalOpenButton>
        <button className='btn btn-danger'>Disable Two-Factor Authentication</button>
      </ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Disable Two-Factor Authentication</h2>
          </ModalTitle>
          <ModalDescription>
            This action will disable two-factor authentication for your account.
          </ModalDescription>
          <DisableTwoFactorForm />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
