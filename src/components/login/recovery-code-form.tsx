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
        <label htmlFor='code'>Recovery Code</label>
        <OtpInput
          id='code'
          name='code'
          required
          autoFocus
          pattern={/^[A-Za-z0-9]*$/}
          // TODO move to config
          maxLength={12}
          className='peer rounded-sm'
          focusClassName='outline-2 outline-offset-4 outline-amber-500'
          containerClassName='flex items-center gap-1 mt-1 text-lg'
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <Fragment key={slotIndex}>
                {slotIndex % (12 / 3) === 0 && slotIndex !== 0 && (
                  <div className='h-0.5 rounded-full bg-zinc-400 px-1'></div>
                )}
                <div
                  className={`flex min-h-7 w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-2 outline-amber-500 ${slot.isActive ? 'peer-focus:outline' : ''}`}
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
