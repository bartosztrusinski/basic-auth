'use client';

import { useEffect, useState, useTransition } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { usePrivateAxios } from '@/hooks/use-private-axios';
import type { User } from '@/db';
import { AxiosError } from 'axios';

export function UserProfile() {
  const [user, setUser] = useState<User>();
  const [isEditing, setIsEditing] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const privateAxios = usePrivateAxios();
  const router = useRouter();
  const pathname = usePathname();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const formData = new FormData(event.currentTarget);
    const name = formData.get('name') as string;

    startTransition(async () => {
      try {
        const response = await privateAxios.patch<User>('/api/users', {
          name,
        });
        setIsEditing(false);
        setUser(response.data);
      } catch (error) {
        setError(
          error instanceof AxiosError
            ? (error.response?.statusText ?? error.message)
            : error instanceof Error
              ? error.message
              : 'An error occurred. Please try again.',
        );
      }
    });
  }

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();

    async function getUser() {
      try {
        const response = await privateAxios.get<User>('/api/users/me', {
          signal: controller.signal,
        });

        if (isMounted) {
          setUser(response.data);
        }
      } catch {
        if (isMounted) {
          router.replace(`/login?redirect=${pathname}`);
        }
      }
    }

    void getUser();

    return () => {
      isMounted = false;
      controller.abort();
    };
  }, [pathname, privateAxios, router]);

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <div className='mb-2 flex items-center gap-2'>
        <strong className='text-lg'>Email: </strong>
        {user ? user.email : <span className='h-5 w-36 animate-pulse rounded bg-gray-700'></span>}
      </div>
      {isEditing ? (
        <form onSubmit={handleSubmit}>
          Name:{' '}
          <input
            name='name'
            required
            placeholder='Name'
            defaultValue={user ? user.name : ''}
            className='rounded bg-white px-2 py-1 text-base text-black'
          />
          <p className='min-h-6 py-3 text-red-500'> {error && error}</p>
          <button disabled={isPending} className='w-full rounded border-2 border-white p-1'>
            {isPending ? 'Saving...' : 'Save'}
          </button>
        </form>
      ) : (
        <>
          <div className='flex items-center gap-2'>
            <strong className='text-lg'>Name: </strong>
            {user ? (
              user.name
            ) : (
              <span className='h-5 w-28 animate-pulse rounded bg-gray-700'></span>
            )}
          </div>
          <button
            onClick={() => setIsEditing(true)}
            className='mt-4 w-full rounded border-2 border-white p-1'
          >
            Edit Profile
          </button>
        </>
      )}
    </>
  );
}
