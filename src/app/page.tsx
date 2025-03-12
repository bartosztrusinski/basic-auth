import { getSession } from '@/lib';

export default async function HomePage() {
  const session = await getSession();

  console.log(session);

  return (
    <div className='text-center'>
      <h1 className='text-2xl font-bold'>Basic Auth</h1>
      <p>{session ? 'You are logged in' : 'You are not logged in'}</p>
    </div>
  );
}
