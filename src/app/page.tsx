import { auth } from '@/auth';

export default async function HomePage() {
  const session = await auth();

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Basic Auth</h1>
      <p className='break-words'>
        {session ? `Welcome back ${session.userId}` : 'You are not logged in'}
      </p>
    </div>
  );
}
