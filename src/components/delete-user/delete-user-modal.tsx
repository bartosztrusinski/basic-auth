'use client';

import dynamic from 'next/dynamic';
import { Modal, ModalContent, ModalOpenButton } from '@/components/ui/modal';
import { ModalCancelButton, ModalCloseButton } from '@/components/ui/modal-buttons';
import { Card, CardHeader, CardDescription, CardFooter } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';

const DeleteUserForm = dynamic(
  () => import('./delete-user-form').then((module) => module.DeleteUserForm),
  {
    ssr: false,
    loading: () => (
      <button disabled className='btn btn-inline btn-danger min-w-20'>
        <Spinner />
      </button>
    ),
  },
);

export function DeleteUserModal() {
  return (
    <Modal>
      <ModalOpenButton className='btn btn-danger'>Delete Account</ModalOpenButton>
      <ModalContent>
        <Card>
          <CardHeader>
            <h2>Delete Account</h2>
          </CardHeader>
          <CardDescription>
            This action is irreversible and will delete all your data.
          </CardDescription>
          <CardFooter>
            <DeleteUserForm />
            <ModalCancelButton />
          </CardFooter>
          <ModalCloseButton />
        </Card>
      </ModalContent>
    </Modal>
  );
}
