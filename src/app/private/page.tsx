import { getUserSession } from '@/auth/session';
import { redirect } from 'next/navigation';

export default async function PrivatePage() {
  const user = await getUserSession();

  if (!user) {
    redirect('/log-in');
  }

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Private Page</h1>
      <p>This page is only accessible to authenticated users.</p>
    </div>
  );
}
