'use client';

import { useActionState, useEffect, useId, useRef } from 'react';
import Image from 'next/image';
import { enableTwoFactorAuth } from '@/actions';
import { Alert } from '@/components/ui/alert';
import { CodeInput } from '@/components/ui/code-input';
import { type TwoFactorSetupState } from './types';

type Props = {
  secret: TwoFactorSetupState['secret'];
  qrCode: TwoFactorSetupState['qrCode'];
  onSuccess?: (data: Partial<TwoFactorSetupState>) => void;
};

export function TwoFactorConfirmationForm({ secret, qrCode, onSuccess }: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(enableTwoFactorAuth, {
    isSuccess: false,
  });

  useEffect(() => {
    if (state.isSuccess) {
      onSuccess?.(state);
    }
  }, [state, onSuccess]);

  return (
    <div className='flex flex-col items-center gap-4'>
      <strong
        className='break-all rounded bg-neutral-800 px-3 py-1.5 font-mono font-normal'
        aria-label='Two-factor authentication secret'
      >
        {secret}
      </strong>
      <Image
        src={qrCode}
        alt='QR code for Two-Factor Authentication'
        width={240}
        height={240}
        className='rounded'
      />
      <form ref={formRef} action={action} className='self-stretch'>
        <div className='space-y-3'>
          <div className='mx-auto max-w-72'>
            <label htmlFor={id}>Two-Factor Authentication Code</label>
            <CodeInput
              id={id}
              name='code'
              required
              autoFocus
              className='peer rounded-sm'
              focusClassName='outline-2 outline-offset-2 outline-primary-500'
              containerClassName='flex gap-1 mt-1 text-xl'
              onComplete={({ isPaste }) => {
                if (isPaste) {
                  formRef.current?.requestSubmit();
                }
              }}
            >
              {(slots) =>
                slots.map((slot, slotIndex) => (
                  <div
                    key={slotIndex}
                    className={`flex aspect-square min-h-8 w-full min-w-8 place-content-center place-items-center rounded-sm bg-neutral-800 text-neutral-50 outline-2 outline-primary-500 ${slot.isActive ? 'peer-focus:outline' : ''}`}
                  >
                    {slot.value}
                    {slot.hasCaret && (
                      <div className='pointer-events-none h-[1em] w-[0.1em] animate-caret-blink bg-current'></div>
                    )}
                  </div>
                ))
              }
            </CodeInput>
          </div>

          {state.errors && <Alert variant='error' message={state.errors} />}
        </div>

        <button disabled={isPending} className='btn mt-5 text-sm'>
          {isPending ? 'Confirming...' : 'Confirm'}
        </button>
      </form>
    </div>
  );
}
