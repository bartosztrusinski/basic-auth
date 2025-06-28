'use client';

import { useActionState } from 'react';
import { verifyEmail } from '@/actions';

type Props = {
  token: string;
};

export function VerifyEmailForm({ token }: Props) {
  const [, action, isPending] = useActionState(verifyEmail.bind(null, token), null);

  return (
    <form action={action}>
      <button type='submit' disabled={isPending} className='btn'>
        {isPending ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
}
