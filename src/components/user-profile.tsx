'use client';

import { useActionState, useState, useTransition } from 'react';
import { editProfile } from '@/actions';
import type { User } from '@/db';

type Props = {
  user: Pick<User, 'email' | 'name'>;
};

export function UserProfile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action] = useActionState(editProfile, null);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);

    startTransition(() => {
      action(formData);
      setIsEditing(false);
    });
  }

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <p className='mb-2'>
        Email: <strong className='text-lg'>{user.email}</strong>
      </p>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          Name:{' '}
          <input
            name='name'
            required
            placeholder='Name'
            defaultValue={user.name}
            className='rounded bg-white px-2 py-1 text-base text-black'
          />
          <p className='min-h-6 text-red-500'> {state?.error && state.error}</p>
          <button disabled={isPending} className='rounded border-2 border-white p-1'>
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : (
        <>
          <p>
            Name: <strong className='text-lg'>{user.name}</strong>
          </p>
          <button
            onClick={() => setIsEditing(true)}
            className='mt-4 rounded border-2 border-white p-1'
          >
            Edit Profile
          </button>
        </>
      )}
    </>
  );
}
