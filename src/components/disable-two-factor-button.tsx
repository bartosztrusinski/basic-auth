'use client';

import { type FormEvent, useActionState, useTransition } from 'react';
import { toast } from 'sonner';
import { getAuthMessage } from '@/auth/message';
import { disableTwoFactorAuth } from '@/actions';
import { ClassyDialog } from '@/components/classy-dialog';
import { ConfirmForm } from '@/components/confirm-form';

export function DisableTwoFactorButton() {
  const [, action, isActionPending] = useActionState(disableTwoFactorAuth, null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { isSuccess, errors } = await disableTwoFactorAuth();

      if (errors && errors.length > 0) {
        toast.error(errors);
      }

      if (isSuccess) {
        const { message } = getAuthMessage('two-factor-disabled');
        toast.success(message);
      }
    });
  }

  return (
    <ClassyDialog
      trigger={<button className='btn btn-danger'>Disable Two-Factor Authentication</button>}
      heading='Disable Two-Factor Authentication'
      description='This action will disable two-factor authentication for your account.'
    >
      {(closeDialog) => (
        <ConfirmForm
          confirmText={isPending || isActionPending ? 'Disabling...' : 'Disable'}
          action={action}
          onSubmit={handleSubmit}
          isPending={isPending || isActionPending}
          onCancel={closeDialog}
          className='btn-danger'
        />
      )}
    </ClassyDialog>
  );
}
