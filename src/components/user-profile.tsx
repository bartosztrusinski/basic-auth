'use client';

import { useActionState, useEffect, useState } from 'react';
import type { FullUser } from '@/auth/session';
import { editProfile } from '@/actions';

type Props = {
  user: FullUser;
};

export function UserProfile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, isPending] = useActionState(editProfile, {});

  useEffect(() => {
    if (state.success) {
      setIsEditing(false);
    }
  }, [state]);

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <section className='mb-6 space-y-5 rounded-lg border border-gray-500 p-6'>
        <p>
          Email: <strong className='text-lg'>{user.email}</strong>
        </p>
        {isEditing ? (
          <form action={action} className='space-y-5'>
            <div className='flex items-center gap-2'>
              <label htmlFor='name'>Name:</label>
              <input
                id='name'
                name='name'
                required
                placeholder='Name'
                defaultValue={user.name}
                className='min-w-0 grow rounded bg-white px-2 py-1 text-base text-black'
              />
            </div>
            <div className='flex items-center gap-2'>
              <label htmlFor='role'>Role:</label>
              <select
                id='role'
                name='role'
                defaultValue={user.role}
                className='grow rounded bg-white px-2 py-1 text-base text-black'
              >
                <option value='admin'>admin</option>
                <option value='user'>user</option>
              </select>
            </div>
            {state.errors && (
              <div className='text-sm font-light text-red-500'>
                {state.errors.map((error, index) => (
                  <p key={index}>{error}</p>
                ))}
              </div>
            )}

            <button disabled={isPending} className='w-full rounded border-2 border-white p-1'>
              {isPending ? 'Saving...' : 'Save'}
            </button>
          </form>
        ) : (
          <>
            <p>
              Name: <strong className='text-lg'>{user.name}</strong>
            </p>
            <p>
              Role: <strong className='text-lg'>{user.role}</strong>
            </p>
            {state.success && (
              <div className='text-sm font-light text-green-500'>Profile updated successfully!</div>
            )}
            <button
              onClick={() => setIsEditing(true)}
              className='w-full rounded border-2 border-white p-1'
            >
              Edit Profile
            </button>
          </>
        )}
      </section>
    </>
  );
}
