import { getSession } from '@/lib';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  return (
    <>
      <h1 className='mb-6 text-4xl font-bold'>Your Profile</h1>
      <div className='space-y-2'>
        <p>
          Email: <strong className='text-lg'>{user.email}</strong>
        </p>
        <p>
          Name: <strong className='text-lg'>{user.name}</strong>
        </p>
      </div>
    </>
  );
}
