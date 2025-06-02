'use client';

import { type ComponentProps } from 'react';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
  ModalContainer,
} from '@/components/ui/classy-modal';
import { AddPasswordForm } from './add-password-form';

type Props = ComponentProps<typeof AddPasswordForm>;

export function AddPasswordModal(props: Props) {
  return (
    <Modal>
      <ModalOpenButton>
        <button className='btn'>Add Password</button>
      </ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Set Password</h2>
          </ModalTitle>
          <ModalDescription>
            After setting a password, you will be able to log in with your email and password.
          </ModalDescription>
          <AddPasswordForm {...props} />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
