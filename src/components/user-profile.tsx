'use client';

import { useState, useTransition } from 'react';
import { type User } from '@/db';
import { editProfile } from '@/actions';
import { useAuth } from '@/auth/hooks/use-auth';

type Props = {
  user: Pick<User, 'email' | 'name' | 'role'>;
};

export function UserProfile({ user }: Props) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errors, setErrors] = useState<string[]>([]);
  const [isPending, startTransition] = useTransition();
  const { syncAuth } = useAuth();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    setIsSuccess(false);
    event.preventDefault();

    startTransition(async () => {
      const { success, errors, isUnauthenticated } = await editProfile(formData);

      if (isUnauthenticated) {
        await syncAuth();
      }

      if (success) {
        setIsEditing(false);
        setIsSuccess(true);
      }

      if (errors) {
        setErrors(errors);
      }
    });
  }

  return (
    <div className='space-y-4 rounded-lg border border-zinc-600 p-6'>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {isEditing ? (
        <form onSubmit={handleSubmit} className='space-y-4'>
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
              <option value='admin'>admin</option>
              <option value='user'>user</option>
            </select>
          </div>

          {errors && (
            <div className='text-sm font-light text-red-500'>
              {errors.map((error, index) => (
                <p key={index}>{error}</p>
              ))}
            </div>
          )}

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

          {isSuccess && (
            <p className='text-sm font-light text-green-500'>Profile updated successfully!</p>
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
