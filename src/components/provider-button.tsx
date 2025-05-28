import { logInWithProvider } from '@/auth/actions';
import { type OAuthProvider } from '@/auth/oauth';

type Props = {
  provider: OAuthProvider;
  name: string;
};

export function ProviderButton({ provider, name }: Props) {
  return (
    <form
      action={async () => {
        'use server';
        await logInWithProvider(provider);
      }}
    >
      <button type='submit' className='btn'>
        {name}
      </button>
    </form>
  );
}
