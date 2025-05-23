'use client';

import { useActionState, Fragment } from 'react';
import { type TwoFactorAttempt } from '@/db';
import { useRecoveryCode } from '@/auth/actions';
import { Alert } from '@/components/alert';
import { OtpInput } from '@/components/otp-input';

type Props = {
  token: TwoFactorAttempt['token'];
};

export function RecoveryCodeForm({ token }: Props) {
  const [state, action, isPending] = useActionState(useRecoveryCode.bind(null, token), {
    isSuccess: false,
    errors: '',
  });

  return (
    <form action={action} className='flex flex-col gap-5'>
      <div>
        <label htmlFor='code' className='text-sm text-zinc-400'>
          Recovery Code
        </label>
        <OtpInput
          id='code'
          name='code'
          required
          autoFocus
          // TODO move to config
          pattern={/^[ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789]*$/}
          maxLength={12}
          className='peer rounded'
          focusClassName='outline-2 outline-zinc-400'
          containerClassName='flex items-center gap-1 p-0.5'
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <Fragment key={slotIndex}>
                {slotIndex % 4 === 0 && slotIndex !== 0 && (
                  <div className='h-0.5 rounded-full bg-zinc-400 px-1'></div>
                )}
                <div
                  className={`flex aspect-square w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-2 outline-zinc-400 ${slot.isActive ? 'peer-focus:outline' : ''}`}
                >
                  {slot.value}
                  {slot.hasCaret && (
                    <div className='pointer-events-none h-[1em] w-[0.1em] animate-caret-blink bg-current'></div>
                  )}
                  {slot.placeholder && (
                    <span className='pointer-events-none text-zinc-400'>{slot.placeholder}</span>
                  )}
                </div>
              </Fragment>
            ))
          }
        </OtpInput>
      </div>

      {state.errors && <Alert variant='error' message={state.errors} />}

      <button
        disabled={isPending}
        className='rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
      >
        {isPending ? 'Logging In...' : 'Use Code'}
      </button>
    </form>
  );
}
