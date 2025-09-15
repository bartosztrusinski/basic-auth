'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCloseButton, ModalContainer } from '@/components/ui/classy-modal';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { Spinner } from '@/components/ui/spinner';

const EnableTwoFactorForm = dynamic(
  () => import('./enable-two-factor-form').then((module) => module.EnableTwoFactorForm),
  {
    ssr: false,
    loading: () => (
      <ModalContainer>
        <SkeletonBlock className='h-6 w-3/4' />
        <div className='mt-2 w-11/12 space-y-2'>
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4 w-3/4' />
        </div>
        <SkeletonBlock className='w-96' />
        <button disabled className='btn'>
          <Spinner />
        </button>
      </ModalContainer>
    ),
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
