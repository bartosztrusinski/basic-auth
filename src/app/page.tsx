import { getSession } from '@/lib';

export default async function HomePage() {
  const session = await getSession();

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Basic Auth</h1>
      <p>{session ? `Welcome back ${session.user.name}!` : 'You are not logged in'}</p>
    </div>
  );
}
