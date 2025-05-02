'use client';

import { useActionState, useEffect, useState } from 'react';
import { type User } from '@/db';
import { useCurrentUser } from '@/auth/hooks/use-current-user';
import { editProfile } from '@/actions';
import { Alert } from '@/components/alert';

type Props = {
  user: Pick<User, 'email' | 'name' | 'role'>;
  roles: readonly User['role'][];
};

export function UserProfile({ user, roles }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [state, action, isPending] = useActionState(editProfile, { isSuccess: false });
  const { currentUser } = useCurrentUser();

  useEffect(() => {
    if (state.isSuccess) {
      setIsEditing(false);
      void currentUser?.reload();
    }
  }, [currentUser, state]);

  return (
    <div className='space-y-4 rounded-lg border border-zinc-600 p-6'>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {isEditing ? (
        <form action={action} className='space-y-4'>
          <div className='flex items-center gap-2'>
            <label htmlFor='name'>
              <strong>Name:</strong>
            </label>
            <input
              id='name'
              name='name'
              required
              placeholder='Name'
              defaultValue={user.name}
              autoComplete='name'
              className='h-6 grow rounded bg-white px-1 text-base text-black'
            />
          </div>
          <div className='flex items-center gap-2'>
            <label htmlFor='role'>
              <strong>Role:</strong>
            </label>
            <select
              id='role'
              name='role'
              defaultValue={user.role}
              className='h-6 grow rounded bg-white px-1 text-base text-black'
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </select>
          </div>

          {state.errors && <Alert variant='error' message={state.errors} />}

          <div className='flex gap-2'>
            <button
              type='submit'
              disabled={isPending}
              className='grow rounded border-2 border-white p-1'
            >
              {isPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type='button'
              onClick={() => setIsEditing(false)}
              className='w-9 rounded border-2 border-white font-bold'
            >
              ⨉
            </button>
          </div>
        </form>
      ) : (
        <>
          <p>
            <strong>Name:</strong> {user.name}
          </p>
          <p>
            <strong>Role:</strong> {user.role}
          </p>

          {state.isSuccess && (
            <Alert variant='success' message='Profile updated successfully!' isClosable={true} />
          )}

          <button
            onClick={() => setIsEditing(true)}
            className='w-full rounded border-2 border-white p-1'
          >
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
