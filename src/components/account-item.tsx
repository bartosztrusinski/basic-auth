'use client';

import { type FormEvent, useActionState, useTransition } from 'react';
import { toast } from 'sonner';
import { type OAuthProvider } from '@/auth/oauth';
import { getAuthMessage } from '@/auth/message';
import { unlinkAccount, linkAccount } from '@/actions';

type Props = {
  provider: OAuthProvider;
  name: string;
  isLinked: boolean;
  isUnlinkingEnabled: boolean;
};

export function AccountItem({ provider, name, isLinked, isUnlinkingEnabled }: Props) {
  const accountAction = isLinked ? unlinkAccount : linkAccount;
  const [isPending, startTransition] = useTransition();
  const [, action, isActionPending] = useActionState(accountAction.bind(null, provider), {
    isSuccess: false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { isSuccess, errors } = await accountAction(provider);

      if (errors && errors.length > 0) {
        toast.error(errors);
      }

      if (isSuccess) {
        const { message } = getAuthMessage('oauth-unlink');
        toast.success(message);
      }
    });
  }

  return (
    <div className='flex justify-between rounded-lg border border-neutral-600 p-3 shadow-md'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>{name}</span>
        {isLinked && (
          <div className='border-success-500 text-success-500 rounded-full border p-0.5 px-1.5 text-xs font-light leading-none'>
            Linked
          </div>
        )}
      </div>
      <form action={action} onSubmit={handleSubmit} className='basis-24'>
        {!isLinked ? (
          <button type='submit' disabled={isPending || isActionPending} className='btn p-1'>
            {isPending || isActionPending ? 'Linking...' : 'Link'}
          </button>
        ) : (
          isUnlinkingEnabled && (
            <button
              type='submit'
              disabled={isPending || isActionPending}
              className='btn btn-danger p-1'
            >
              {isPending || isActionPending ? 'Unlinking...' : 'Unlink'}
            </button>
          )
        )}
      </form>
    </div>
  );
}
