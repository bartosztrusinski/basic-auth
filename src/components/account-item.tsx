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
    <div className='flex min-h-14 justify-between rounded-lg bg-zinc-800 p-3'>
      <div className='flex items-center gap-2'>
        <span className='font-semibold'>{name}</span>
        {isLinked && (
          <div className='rounded-full border border-green-500 p-0.5 px-1.5 text-xs font-light leading-none text-green-500'>
            Linked
          </div>
        )}
      </div>
      <form action={action} onSubmit={handleSubmit} className='basis-24'>
        {!isLinked ? (
          <button
            disabled={isPending || isActionPending}
            className='w-full rounded border border-zinc-400 p-1 px-2 font-bold shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending || isActionPending ? 'Linking...' : 'Link'}
          </button>
        ) : (
          isUnlinkingEnabled && (
            <button
              disabled={isPending || isActionPending}
              className='w-full rounded bg-red-600 p-1 px-2 font-bold shadow disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending || isActionPending ? 'Unlinking...' : 'Unlink'}
            </button>
          )
        )}
      </form>
    </div>
  );
}
