'use client';

import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalCloseButton,
  ModalContainer,
  ModalDescription,
  ModalTitle,
} from '@/components/ui/classy-modal';
import { LogoutEverywhereForm } from './logout-everywhere-form';

export function LogoutEverywhereModal() {
  return (
    <Modal>
      <ModalOpenButton>
        <button className='btn btn-danger'>Log Out Everywhere</button>
      </ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Log Out Everywhere</h2>
          </ModalTitle>
          <ModalDescription>
            This action will log you out of all devices and sessions.
          </ModalDescription>
          <LogoutEverywhereForm />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
