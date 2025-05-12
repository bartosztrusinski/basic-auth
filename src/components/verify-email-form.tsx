'use client';

import { useActionState } from 'react';
import { type VerificationToken } from '@/db';
import { verifyEmail } from '@/actions';

type Props = {
  token: VerificationToken['token'];
};

export function VerifyEmailForm({ token }: Props) {
  const [, action, isPending] = useActionState(verifyEmail.bind(null, token), null);

  return (
    <form action={action} className='flex flex-col gap-5'>
      <button disabled={isPending} className='rounded border-2 border-white p-1'>
        {isPending ? 'Verifying...' : 'Verify Email'}
      </button>
    </form>
  );
}
