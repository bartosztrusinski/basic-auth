'use client';

import { useActionState, Fragment, useRef } from 'react';
import { type TwoFactorAttempt } from '@/db';
import { useRecoveryCode } from '@/auth/actions';
import config from '@/auth/config';
import { Alert } from '@/components/alert';
import { CodeInput } from '@/components/code-input';

type Props = {
  token: TwoFactorAttempt['token'];
};

export function RecoveryCodeForm({ token }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(useRecoveryCode.bind(null, token), {
    isSuccess: false,
    errors: '',
  });

  return (
    <form ref={formRef} action={action} className='flex flex-col gap-5'>
      <div>
        <label htmlFor='code'>Recovery Code</label>
        <CodeInput
          id='code'
          name='code'
          required
          autoFocus
          pattern={/^[A-Za-z0-9]*$/}
          maxLength={config.recoveryCodeLength}
          className='peer rounded-sm'
          focusClassName='outline-2 outline-offset-4 outline-amber-500'
          containerClassName='flex items-center gap-1 mt-1 text-lg'
          onComplete={({ isPaste }) => {
            if (isPaste) {
              formRef.current?.requestSubmit();
            }
          }}
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <Fragment key={slotIndex}>
                {slotIndex % 4 === 0 && slotIndex !== 0 && (
                  <div className='h-0.5 rounded-full bg-zinc-400 px-1'></div>
                )}
                <div
                  className={`flex min-h-7 w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-2 outline-amber-500 ${slot.isActive ? 'peer-focus:outline' : ''}`}
                >
                  {slot.value}
                  {slot.hasCaret && (
                    <div className='pointer-events-none h-[1em] w-[0.1em] animate-caret-blink bg-current'></div>
                  )}
                </div>
              </Fragment>
            ))
          }
        </CodeInput>
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
