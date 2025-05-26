'use client';

import { useActionState, Fragment, useRef } from 'react';
import { type TwoFactorAttempt } from '@/db';
import { verifyTwoFactorCode } from '@/auth/actions';
import { Alert } from '@/components/alert';
import { CodeInput } from '@/components/code-input';

type Props = {
  token: TwoFactorAttempt['token'];
};

export function TwoFactorForm({ token }: Props) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(verifyTwoFactorCode.bind(null, token), {
    isSuccess: false,
    errors: '',
  });

  return (
    <form ref={formRef} action={action} className='flex flex-col gap-5'>
      <div>
        <label htmlFor='code'>Two-Factor Authentication Code</label>
        <CodeInput
          id='code'
          name='code'
          required
          autoFocus
          className='peer rounded-sm'
          placeholder='314159'
          focusClassName='outline-4 outline-offset-4 outline-amber-500'
          containerClassName='flex items-center gap-2 mt-1 text-xl sm:text-2xl'
          onComplete={({ isPaste }) => {
            if (isPaste) {
              formRef.current?.requestSubmit();
            }
          }}
        >
          {(slots) =>
            slots.map((slot, slotIndex) => (
              <Fragment key={slotIndex}>
                {slotIndex === slots.length / 2 && (
                  <div className='h-0.5 rounded-full bg-zinc-400 px-1.5'></div>
                )}
                <div
                  className={`flex aspect-square w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-4 outline-amber-500 ${slot.isActive ? 'peer-focus:outline' : ''}`}
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
        </CodeInput>
      </div>

      {state.errors && <Alert variant='error' message={state.errors} />}

      <button
        disabled={isPending}
        className='rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
      >
        {isPending ? 'Logging In...' : 'Confirm'}
      </button>
    </form>
  );
}
