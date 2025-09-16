'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCancelButton, ModalCloseButton } from '@/components/ui/modal-buttons';
import { Card, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const DisableTwoFactorForm = dynamic(
  () => import('./disable-two-factor-form').then((mod) => mod.DisableTwoFactorForm),
  {
    ssr: false,
    loading: () => (
      <button disabled className='btn btn-inline btn-danger min-w-20'>
        <Spinner />
      </button>
    ),
  },
);

export function DisableTwoFactorModal() {
  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>
        Disable Two-Factor Authentication
      </ModalOpenButton>
      <ModalContent>
        <Card>
          <CardHeader>
            <h2>Disable Two-Factor Authentication</h2>
          </CardHeader>
          <CardDescription>
            This action will disable two-factor authentication for your account.
          </CardDescription>
          <CardFooter>
            <DisableTwoFactorForm />
            <ModalCancelButton />
          </CardFooter>
          <ModalCloseButton />
        </Card>
      </ModalContent>
    </Modal>
  );
}
