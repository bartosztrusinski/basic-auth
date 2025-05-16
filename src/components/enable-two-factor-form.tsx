'use client';

import { type FormEvent, useActionState, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { toast } from 'sonner';
import { type TwoFactorSetup } from '@/db';
import { enableTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/alert';
import { OtpInput } from '@/components/otp-input';
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
  const formRef = useRef<HTMLFormElement>(null);

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
      <form
        ref={formRef}
        action={action}
        onSubmit={handleSubmit}
        className='flex flex-col gap-3 self-stretch'
      >
        <OtpInput
          id='token'
          name='token'
          required
          autoFocus
          className='peer rounded'
          focusClassName='outline-2 outline-zinc-400'
          containerClassName='mx-auto flex w-min items-center justify-between gap-1 p-0.5'
          onComplete={() => formRef.current?.requestSubmit()}
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={`flex size-10 place-content-center place-items-center rounded-sm bg-zinc-800 text-center text-lg text-zinc-50 outline-2 outline-zinc-400 ${slot.isActive ? 'peer-focus:outline' : ''}`}
              >
                {slot.value}
                {slot.hasCaret && (
                  <span className='pointer-events-none h-[1.5ch] w-[0.2ch] animate-caret-blink bg-current'></span>
                )}
                {slot.placeholder && (
                  <span className='pointer-events-none text-zinc-500'>{slot.placeholder}</span>
                )}
              </div>
            ))
          }
        </OtpInput>

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
