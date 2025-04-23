import { type Account } from '@/db';
import { logInWithProvider, unlinkAccount } from '../actions';
import { getProviderName } from '../oauth';
import { OAuthProviderEnum } from '../oauth/providers';

type Props = {
  accounts: Account[];
};

export function LinkedAccounts({ accounts }: Props) {
  return OAuthProviderEnum.options.map((provider) => {
    const account = accounts.find((account) => account.provider === provider);
    const action = account ? unlinkAccount : logInWithProvider;

    return (
      <div key={provider} className='flex justify-between rounded-lg bg-zinc-800 p-3'>
        <div className='flex items-center gap-2'>
          <span>{getProviderName(provider)}</span>
          {account && (
            <div className='rounded-full border border-green-500 p-1 px-2 text-xs font-bold leading-none text-green-500'>
              Linked
            </div>
          )}
        </div>
        <form key={provider} action={action.bind(null, provider)} className='basis-20'>
          <button
            className={`w-full rounded p-1 font-bold shadow ${account ? 'bg-red-600' : 'bg-green-600'}`}
          >
            {account ? 'Unlink' : 'Link'}
          </button>
        </form>
      </div>
    );
  });
}
