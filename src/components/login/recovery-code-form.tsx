'use client';

import { useActionState, Fragment, useRef, useId } from 'react';
import { type TwoFactorAttempt } from '@/data/two-factor-attempt';
import { useRecoveryCode } from '@/auth/actions/two-factor';
import config from '@/auth/config';
import { Alert } from '@/components/ui/alert';
import { CodeInput } from '@/components/ui/code-input';

type Props = {
  token: TwoFactorAttempt['token'];
};

export function RecoveryCodeForm({ token }: Props) {
  const id = useId();
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(useRecoveryCode.bind(null, token), {
    isSuccess: false,
    errors: '',
  });

  return (
    <form ref={formRef} action={action}>
      <div className='space-y-3'>
        <div>
          <label htmlFor={id}>Recovery Code</label>
          <CodeInput
            id={id}
            name='code'
            pattern={/^[A-Za-z0-9]*$/}
            maxLength={config.recoveryCodeLength}
            required
            autoFocus
            autoComplete='off'
            className='peer rounded-sm'
            focusClassName='outline outline-2 outline-offset-4 outline-primary-500'
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
                    <div className='h-0.5 rounded-full bg-neutral-400 px-1'></div>
                  )}
                  <div
                    className={`flex min-h-7 w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-2 outline-primary-500 ${slot.isActive ? 'peer-focus:outline' : ''}`}
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
      </div>

      <button disabled={isPending} className='btn mt-5'>
        {isPending ? 'Logging In...' : 'Use Recovery Code'}
      </button>
    </form>
  );
}
