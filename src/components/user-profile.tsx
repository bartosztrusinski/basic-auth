'use client';

import { type FormEvent, useActionState, useState, useTransition } from 'react';
import { toast } from 'sonner';
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
  const [errors, setErrors] = useState<string | string[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [state, action, isActionPending] = useActionState(editProfile, { isSuccess: false });
  const { currentUser } = useCurrentUser();

  function openForm() {
    setIsEditing(true);
  }

  function closeForm() {
    setIsEditing(false);
    setErrors(null);
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    const formData = new FormData(event.currentTarget);

    event.preventDefault();
    setErrors(null);

    startTransition(async () => {
      const { isSuccess, errors } = await editProfile(null, formData);

      if (errors) {
        setErrors(errors);
      }

      if (isSuccess) {
        setIsEditing(false);
        toast.success('Profile updated successfully!');
        await currentUser?.reload();
      }
    });
  }

  return (
    <div className='space-y-4 rounded-lg border border-zinc-600 p-6'>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      {isEditing || isPending || isActionPending ? (
        <form action={action} onSubmit={handleSubmit} className='space-y-4'>
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

          <Alert variant='error' message={errors ?? state.errors ?? []} />

          <div className='flex gap-2'>
            <button
              type='submit'
              disabled={isPending || isActionPending}
              className='w-full rounded border border-zinc-500 p-2'
            >
              {isPending || isActionPending ? 'Saving...' : 'Save'}
            </button>
            <button
              type='button'
              onClick={closeForm}
              className='w-10 shrink-0 rounded border border-zinc-500'
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
          <button onClick={openForm} className='w-full rounded border border-zinc-500 p-2'>
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
