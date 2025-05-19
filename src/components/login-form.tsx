'use client';

import { Fragment, useActionState, useEffect, useRef, useState } from 'react';
import { type TwoFactorAttempt } from '@/db';
import { Alert } from '@/components/alert';
import { OtpInput } from '@/components/otp-input';
import { logIn, verifyTwoFactorCode } from '@/auth/actions';

export function LoginForm() {
  const [twoFactorToken, setTwoFactorToken] = useState<TwoFactorAttempt['token'] | null>(null);

  function goBack() {
    setTwoFactorToken(null);
  }

  return twoFactorToken ? (
    <TwoFactorForm token={twoFactorToken} onBack={goBack} />
  ) : (
    <CredentialsForm
      onTwoFactorRequired={(token) => {
        setTwoFactorToken(token);
      }}
    />
  );
}

type CredentialsFormProps = {
  onTwoFactorRequired?: (token: TwoFactorAttempt['token']) => void;
};

function CredentialsForm({ onTwoFactorRequired }: CredentialsFormProps) {
  const [state, action, isPending] = useActionState(logIn, {
    isSuccess: false,
    errors: '',
  });

  useEffect(() => {
    if (state.data?.twoFactorToken) {
      onTwoFactorRequired?.(state.data.twoFactorToken);
    }
  }, [onTwoFactorRequired, state]);

  return (
    <form action={action} className='flex flex-col gap-4'>
      <input
        type='email'
        name='email'
        required
        autoFocus
        placeholder='Email'
        autoComplete='email'
        className='rounded-sm bg-white px-2 py-1 text-base text-black'
        defaultValue={!state.isSuccess ? state.fields?.email : undefined}
      />
      <input
        type='password'
        name='password'
        required
        placeholder='********'
        autoComplete='current-password'
        className='rounded-sm bg-white px-2 py-1 text-base text-black'
      />

      {state.errors && <Alert variant='error' message={state.errors} />}

      <button
        disabled={isPending}
        className='mt-2 rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
      >
        {isPending ? 'Submitting...' : 'Log In'}
      </button>
    </form>
  );
}

type TwoFactorFormProps = {
  token: TwoFactorAttempt['token'];
  onBack?: () => void;
};

function TwoFactorForm({ token, onBack }: TwoFactorFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [state, action, isPending] = useActionState(verifyTwoFactorCode.bind(null, token), {
    isSuccess: false,
    errors: '',
  });

  return (
    <>
      <button
        type='button'
        className='size-10 rounded bg-zinc-800 shadow outline-current focus-visible:outline-2'
        onClick={onBack}
      >
        ←<label className='sr-only'>Go back to credentials form</label>
      </button>
      <form ref={formRef} action={action} className='flex flex-col gap-5'>
        <div>
          <OtpInput
            name='code'
            required
            autoFocus
            className='peer rounded'
            placeholder='314159'
            focusClassName='outline-4 outline-zinc-400'
            containerClassName='flex items-center gap-2 p-0.5 text-xl sm:text-2xl'
            onComplete={() => formRef.current?.requestSubmit()}
          >
            {(slots) =>
              slots.map((slot, slotIndex) => (
                <Fragment key={slotIndex}>
                  {slotIndex === slots.length / 2 && (
                    <div className='h-0.5 rounded-full bg-zinc-400 px-1.5'></div>
                  )}
                  <div
                    className={`flex aspect-square w-full place-content-center place-items-center rounded-sm bg-white text-black outline-2 outline-offset-4 outline-zinc-400 ${slot.isActive ? 'peer-focus:outline' : ''}`}
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
          <p className='mt-1 text-center text-sm text-zinc-400'>
            Enter the code from your authenticator app
          </p>
        </div>

        {state.errors && <Alert variant='error' message={state.errors} />}

        <button
          disabled={isPending}
          className='rounded bg-zinc-800 p-2 font-bold shadow outline-current focus-visible:outline-2'
        >
          {isPending ? 'Submitting...' : 'Confirm'}
        </button>
      </form>
    </>
  );
}
