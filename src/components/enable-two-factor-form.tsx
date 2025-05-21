'use client';

import { type FormEvent, useActionState, useRef, useState, useTransition } from 'react';
import Image from 'next/image';
import { type TwoFactorSetup } from '@/db';
import { enableTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/alert';
import { OtpInput } from '@/components/otp-input';

type Props = {
  secret: TwoFactorSetup['secret'];
  qrCode: string;
  onSuccess?: (data: { recoveryCodes: string[] }) => void;
};

export function EnableTwoFactorForm({ secret, qrCode, onSuccess }: Props) {
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
      const state = await enableTwoFactorAuth(null, formData);

      if (state.errors) {
        setErrors(state.errors);
      }

      if (state.isSuccess) {
        onSuccess?.({ recoveryCodes: state.recoveryCodes });
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
          name='code'
          required
          autoFocus
          className='peer rounded'
          focusClassName='outline-2 outline-zinc-400'
          containerClassName='w-full mx-auto max-w-64 flex gap-1 p-0.5 text-lg'
          onComplete={() => formRef.current?.requestSubmit()}
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <div
                key={slotIndex}
                className={`flex aspect-square min-h-8 w-full min-w-8 place-content-center place-items-center rounded-sm bg-zinc-800 text-zinc-50 outline-2 outline-zinc-400 ${slot.isActive ? 'peer-focus:outline' : ''}`}
              >
                {slot.value}
                {slot.hasCaret && (
                  <div className='pointer-events-none h-[1em] w-[0.1em] animate-caret-blink bg-current'></div>
                )}
                {slot.placeholder && (
                  <span className='pointer-events-none text-zinc-500'>{slot.placeholder}</span>
                )}
              </div>
            ))
          }
        </OtpInput>

        <Alert variant='error' message={errors ?? state.errors ?? []} />

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
