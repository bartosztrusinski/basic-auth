import { getUserSession } from '@/auth/session';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await getUserSession();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Admin Page</h1>
      <p>This page is only accessible to admins.</p>
    </div>
  );
}
