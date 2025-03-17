'use client';

import { editProfile } from '@/actions';
import type { User } from '@/data';
import { useActionState, useEffect, useState } from 'react';

type Props = {
  user: Pick<User, 'email' | 'name'>;
};

export function UserProfile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, isPending] = useActionState(editProfile, null);

  useEffect(() => {
    if (state?.success) {
      setIsEditing(false);
    }
  }, [state?.success]);

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <p className='mb-2'>
        Email: <strong className='text-lg'>{user.email}</strong>
      </p>
      {isEditing ? (
        <form action={action}>
          Name:{' '}
          <input
            name='name'
            required
            placeholder='Name'
            defaultValue={user.name}
            className='rounded bg-white px-2 py-1 text-base text-black'
          />
          <button disabled={isPending} className='mt-4 rounded border-2 border-white p-1'>
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
