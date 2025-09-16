'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCloseButton } from '@/components/ui/modal-buttons';
import { Card } from '@/components/ui/card';
import { SkeletonBlock } from '@/components/ui/skeleton-block';
import { Spinner } from '@/components/ui/spinner';

const EnableTwoFactorForm = dynamic(
  () => import('./enable-two-factor-form').then((module) => module.EnableTwoFactorForm),
  {
    ssr: false,
    loading: () => (
      <Card>
        <SkeletonBlock className='w-96 overflow-hidden' />
        <SkeletonBlock className='h-6 w-3/4' />
        <div className='my-2 w-11/12 space-y-2'>
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4' />
          <SkeletonBlock className='h-4 w-3/4' />
        </div>
        <button disabled className='btn'>
          <Spinner />
        </button>
      </Card>
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
