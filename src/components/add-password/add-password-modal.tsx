'use client';

import dynamic from 'next/dynamic';
import { type User } from '@/data/user';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import {
  ModalTitle,
  ModalDescription,
  ModalCloseButton,
  ModalContainer,
} from '@/components/ui/classy-modal';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { Spinner } from '@/components/ui/spinner';

const AddPasswordForm = dynamic(
  () => import('./add-password-form').then((module) => module.AddPasswordForm),
  {
    ssr: false,
    loading: () => (
      <>
        <SkeletonBlock className='mt-5 h-9 w-full' />
        <SkeletonBlock className='mt-5 h-9 w-full' />
        <button disabled className='btn mt-5'>
          <Spinner />
        </button>
      </>
    ),
  },
);

type Props = {
  email: User['email'];
};

export function AddPasswordModal({ email }: Props) {
  return (
    <Modal>
      <ModalOpenButton className='btn'>Add Password</ModalOpenButton>
      <ModalContent>
        <ModalContainer>
          <ModalTitle>
            <h2>Set Password</h2>
          </ModalTitle>
          <ModalDescription>
            After setting a password, you will be able to log in with your email and password.
          </ModalDescription>
          <AddPasswordForm email={email} />
          <ModalCloseButton />
        </ModalContainer>
      </ModalContent>
    </Modal>
  );
}
