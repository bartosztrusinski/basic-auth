'use client';

import { useActionState } from 'react';
import { type VerificationToken } from '@/db/verification-token';
import { verifyEmail } from '@/actions';

type Props = {
  token: VerificationToken['token'];
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
