'use client';

import { useActionState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { enableTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/alert';
import { CodeInput } from '@/components/code-input';
import { type TwoFactorData } from '@/components/enable-two-factor';

type Props = {
  secret: TwoFactorData['secret'];
  qrCode: TwoFactorData['qrCode'];
  onSuccess?: (data: Partial<TwoFactorData>) => void;
};

export function EnableTwoFactorForm({ secret, qrCode, onSuccess }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(enableTwoFactorAuth, {
    isSuccess: false,
  });

  useEffect(() => {
    if (state.isSuccess) {
      const { recoveryCodes } = state;
      onSuccess?.({ recoveryCodes });
    }
  }, [state, onSuccess]);

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
      <form ref={formRef} action={action} className='flex flex-col gap-3 self-stretch'>
        <CodeInput
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
        </CodeInput>

        {state.errors && <Alert variant='error' message={state.errors} />}

        <button
          disabled={isPending}
          className='rounded border border-zinc-700 p-2 text-sm shadow disabled:cursor-not-allowed disabled:opacity-50'
        >
          {isPending ? 'Confirming...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
