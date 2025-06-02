import { useActionState } from 'react';
import { logOutEverywhere } from '@/actions';
import {
  ModalButtonsContainer,
  ModalConfirmButton,
  ModalCancelButton,
} from '@/components/ui/classy-modal';

export function LogoutEverywhereForm() {
  const [, action, isPending] = useActionState(logOutEverywhere, null);

  return (
    <form action={action}>
      <ModalButtonsContainer>
        <ModalConfirmButton disabled={isPending} className='btn-danger'>
          {isPending ? 'Logging out...' : 'Log Out'}
        </ModalConfirmButton>
        <ModalCancelButton />
      </ModalButtonsContainer>
    </form>
  );
}
