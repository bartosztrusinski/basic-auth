import { type Account } from '@/db';
import { logInWithProvider, unlinkAccount } from '../actions';
import { getProviderName } from '../oauth';
import { OAuthProviderEnum } from '../oauth/providers';
import { currentUser } from '@/auth/session';

type Props = {
  accounts: Account[];
};

export async function LinkedAccounts({ accounts }: Props) {
  const user = await currentUser();

  return OAuthProviderEnum.options.map((provider) => {
    const isLinked = accounts.some((account) => account.provider === provider);
    const action = isLinked ? unlinkAccount : logInWithProvider;
    const isUnlinkingEnabled = accounts.length > 1 || user?.hasPassword;

    return (
      <div key={provider} className='flex min-h-14 justify-between rounded-lg bg-zinc-800 p-3'>
        <div className='flex items-center gap-2'>
          <span className='font-semibold'>{getProviderName(provider)}</span>
          {isLinked && (
            <div className='rounded-full border border-green-500 p-0.5 px-1.5 text-xs font-light leading-none text-green-500'>
              Linked
            </div>
          )}
        </div>
        <form key={provider} action={action.bind(null, provider)} className='basis-20'>
          {!isLinked ? (
            <button className='w-full rounded bg-green-600 p-1 font-bold shadow'>Link</button>
          ) : (
            isUnlinkingEnabled && (
              <button className='w-full rounded bg-red-600 p-1 font-bold shadow'>Unlink</button>
            )
          )}
        </form>
      </div>
    );
  });
}
