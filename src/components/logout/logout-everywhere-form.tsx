'use client';

import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
import { ModalConfirmButton } from '@/components/ui/classy-modal';

export function LogoutEverywhereForm() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <form action={action}>
      <ModalConfirmButton disabled={isPending} className='btn-danger'>
        {isPending ? 'Logging out...' : 'Log Out'}
      </ModalConfirmButton>
    </form>
  );
}
