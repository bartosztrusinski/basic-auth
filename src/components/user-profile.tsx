'use client';

import { useState } from 'react';
import type { FullUser } from '@/auth/session';

type Props = {
  user: FullUser;
};

export function UserProfile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <p className='mb-2'>
        Email: <strong className='text-lg'>{user.email}</strong>
      </p>
      {isEditing ? (
        <form>
          Name:{' '}
          <input
            name='name'
            required
            placeholder='Name'
            defaultValue={user.name}
            className='rounded bg-white px-2 py-1 text-base text-black'
          />
          {/* <p className='min-h-6 text-red-500'> {state?.error && state.error}</p>
          <button disabled={isPending} className='rounded border-2 border-white p-1'>
            {isPending ? 'Saving...' : 'Save'}
          </button> */}
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
