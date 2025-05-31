'use client';

import { type FormEvent, useActionState, useId, useState, useTransition } from 'react';
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
  const id = useId();
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
    <div className='space-y-5 rounded-xl border border-neutral-700 p-4 shadow-lg'>
      <div className='flex flex-col break-all'>
        <span className='font-medium text-neutral-400'>Email</span>
        {user.email}
      </div>
      {isEditing || isPending || isActionPending ? (
        <form action={action} onSubmit={handleSubmit} className='space-y-3'>
          <div className='flex flex-col'>
            <label htmlFor={`${id}-name`} className='font-medium text-neutral-400'>
              Name
            </label>
            <input
              id={`${id}-name`}
              name='name'
              placeholder='John Doe'
              autoComplete='name'
              required
              autoFocus
              className='form-control'
              defaultValue={user.name}
            />
          </div>
          <div className='flex flex-col'>
            <label htmlFor={`${id}-role`} className='font-medium text-neutral-400'>
              Role
            </label>
            <select
              id={`${id}-role`}
              name='role'
              required
              className='form-control'
              defaultValue={user.role}
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
              className='btn w-auto grow'
            >
              {isPending || isActionPending ? 'Saving...' : 'Save'}
            </button>
            <button type='button' onClick={closeForm} className='btn size-10'>
              ⨉
            </button>
          </div>
        </form>
      ) : (
        <>
          <div className='flex flex-col break-all'>
            <span className='font-medium text-neutral-400'>Name</span>
            {user.name}
          </div>
          <div className='flex flex-col'>
            <span className='font-medium text-neutral-400'>Role</span>
            {user.role}
          </div>
          <button onClick={openForm} className='btn'>
            Edit Profile
          </button>
        </>
      )}
    </div>
  );
}
