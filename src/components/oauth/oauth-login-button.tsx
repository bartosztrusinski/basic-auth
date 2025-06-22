import { logInWithProvider } from '@/auth/actions/oauth';
import { type OAuthProvider, type StateData } from '@/auth/oauth';

type Props = {
  provider: OAuthProvider;
  name: string;
} & StateData;

export function OAuthLoginButton({ provider, name, ...stateData }: Props) {
  return (
    <form
      action={async () => {
        'use server';
        await logInWithProvider(provider, stateData);
      }}
    >
      <button type='submit' className='btn'>
        {name}
      </button>
    </form>
  );
}
