'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { EnableTwoFactorSkeleton } from '@/components/two-factor/enable-two-factor-skeleton';
import { ModalCloseButton } from '@/components/ui/classy-modal';

const EnableTwoFactorForm = dynamic(
  () => import('./enable-two-factor-form').then((module) => module.EnableTwoFactorForm),
  {
    ssr: false,
    loading: () => <EnableTwoFactorSkeleton />,
  },
);

export function EnableTwoFactorModal() {
  return (
    <Modal closeOnBackdropClick={false}>
      <ModalOpenButton className='btn'>Enable Two-Factor Authentication</ModalOpenButton>
      <ModalContent>
        <EnableTwoFactorForm />
        <ModalCloseButton />
      </ModalContent>
    </Modal>
  );
}
