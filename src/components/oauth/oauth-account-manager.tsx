'use client';

import { type FormEvent, useActionState, useTransition } from 'react';
import { toast } from 'sonner';
import { type OAuthProvider, type StateData } from '@/auth/oauth';
import { getAuthMessage } from '@/auth/message';
import { unlinkAccount, linkAccount } from '@/actions';

type Props = {
  provider: OAuthProvider;
  name: string;
  isLinked: boolean;
  isUnlinkingEnabled: boolean;
} & StateData;

export function OAuthAccountManager({
  provider,
  name,
  isLinked,
  isUnlinkingEnabled,
  ...stateData
}: Props) {
  const accountAction = isLinked
    ? unlinkAccount.bind(null, provider)
    : linkAccount.bind(null, provider, stateData);
  const [, action, isActionPending] = useActionState(accountAction, { isSuccess: false });
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const { isSuccess, errors } = await accountAction();

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
    <div className='flex justify-between rounded-xl border border-neutral-700 p-3 shadow-lg'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>{name}</span>
        {isLinked && (
          <div className='rounded-full border border-success-500 p-0.5 px-1.5 text-xs font-light leading-none text-success-500'>
            Linked
          </div>
        )}
      </div>
      <form action={action} onSubmit={handleSubmit} className='min-h-8 basis-24'>
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
