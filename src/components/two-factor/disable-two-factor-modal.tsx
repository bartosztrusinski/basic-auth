'use client';

import { useActionState, useTransition, type FormEvent } from 'react';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { disableTwoFactorAuth } from '@/actions';
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

export function DisableTwoFactorModal() {
  const [, action, isActionPending] = useActionState(disableTwoFactorAuth, null);
  const [isTransitionPending, startTransition] = useTransition();
  const isPending = isTransitionPending || isActionPending;

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { isSuccess, errors } = await disableTwoFactorAuth();

      if (errors && errors.length > 0) {
        toast.error(errors);
      }

      if (isSuccess) {
        const { message } = getAuthMessage('two-factor-disabled');
        toast.success(message);
      }
    });
  }

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
          <form action={action} onSubmit={handleSubmit}>
            <ModalButtonsContainer>
              <ModalConfirmButton disabled={isPending} className='btn-danger'>
                {isPending ? 'Disabling...' : 'Disable'}
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
