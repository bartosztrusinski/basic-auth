import { getUserSession } from '@/auth/session';

export default async function HomePage() {
  const user = await getUserSession();

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Basic Auth</h1>
      <p>{user ? `Welcome back ${user.id}!` : 'You are not logged in'}</p>
    </div>
  );
}
