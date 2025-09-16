'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCancelButton, ModalCloseButton } from '@/components/ui/modal-buttons';
import { Card, CardDescription, CardHeader, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const LogoutEverywhereForm = dynamic(
  () => import('./logout-everywhere-form').then((module) => module.LogoutEverywhereForm),
  {
    ssr: false,
    loading: () => (
      <button disabled className='btn btn-inline btn-danger min-w-20'>
        <Spinner />
      </button>
    ),
  },
);

export function LogoutEverywhereModal() {
  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>Log Out Everywhere</ModalOpenButton>
      <ModalContent>
        <Card>
          <CardHeader>
            <h2>Log Out Everywhere</h2>
          </CardHeader>
          <CardDescription>
            This action will log you out of all devices and sessions.
          </CardDescription>
          <CardFooter>
            <LogoutEverywhereForm />
            <ModalCancelButton />
          </CardFooter>
          <ModalCloseButton />
        </Card>
      </ModalContent>
    </Modal>
  );
}
