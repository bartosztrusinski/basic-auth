'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
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

export function LogoutEverywhereModal() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

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
          <form action={action}>
            <ModalButtonsContainer>
              <ModalConfirmButton disabled={isPending} className='btn-danger'>
                {isPending ? 'Logging out...' : 'Log Out'}
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
