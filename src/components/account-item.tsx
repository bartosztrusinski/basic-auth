'use client';

import { useActionState } from 'react';
import { unlinkAccount, linkAccount } from '@/auth/actions';
import { type OAuthProvider } from '@/auth/oauth/types';

type Props = {
  provider: OAuthProvider;
  name: string;
  isLinked: boolean;
  isUnlinkingEnabled: boolean;
};

export function AccountItem({ provider, name, isLinked, isUnlinkingEnabled }: Props) {
  const accountAction = isLinked ? unlinkAccount : linkAccount;
  const [, action, isPending] = useActionState(accountAction.bind(null, provider), null);

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
      <form action={action} className='basis-20'>
        {!isLinked ? (
          <button
            disabled={isPending}
            className='w-full rounded bg-green-600 p-1 font-bold shadow disabled:cursor-not-allowed disabled:opacity-50'
          >
            {isPending ? 'Linking...' : 'Link'}
          </button>
        ) : (
          isUnlinkingEnabled && (
            <button
              disabled={isPending}
              className='w-full rounded bg-red-600 p-1 font-bold shadow disabled:cursor-not-allowed disabled:opacity-50'
            >
              {isPending ? 'Unlinking...' : 'Unlink'}
            </button>
          )
        )}
      </form>
    </div>
  );
}
