'use client';

import { type FormEvent, useActionState, useState, useTransition } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { type TwoFactorSetup } from '@/db';
import { enableTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/alert';
import { getAuthMessage } from '@/auth/message';

type Props = {
  secret: TwoFactorSetup['secret'];
  qrCode: string;
};

export function EnableTwoFactorForm({ secret, qrCode }: Props) {
  const [errors, setErrors] = useState<string | string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, action, isActionPending] = useActionState(enableTwoFactorAuth, {
    isSuccess: false,
  });

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    event.preventDefault();
    setErrors(null);

    startTransition(async () => {
      const { isSuccess, errors } = await enableTwoFactorAuth(null, formData);

      if (errors) {
        setErrors(errors);
      }

      if (isSuccess) {
        const { message } = getAuthMessage('two-factor-enabled');
        toast.success(message);
      }
    });
  }

  return (
    <div className='flex flex-col items-center gap-4'>
      <code className='break-all rounded bg-zinc-800 px-3 py-1.5'>{secret}</code>
      <Image
        src={qrCode}
        alt='QR code for Two-Factor Authentication'
        width={256}
        height={256}
        className='rounded'
      />
      <form action={action} onSubmit={handleSubmit} className='flex flex-col gap-3 self-stretch'>
        {/* TODO OTP input */}
        <input
          id='token'
          name='token'
          required
          placeholder='123456'
          autoComplete='one-time-code'
          className='rounded-sm bg-white px-2 py-1 text-base text-black'
        />

        {errors && <Alert variant='error' message={errors} />}
        {state.errors && (
          <noscript>
            <p className='rounded border border-red-900 bg-red-950 p-2 text-sm text-red-400'>
              {state.errors}
            </p>
          </noscript>
        )}

        <button
          disabled={isPending || isActionPending}
          className='rounded border border-zinc-700 p-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isPending || isActionPending ? 'Confirming...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
