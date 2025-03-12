import { redirect } from 'next/navigation';
import { logIn } from '@/actions';
import { getSession } from '@/lib';

export default async function LoginPage() {
  const session = await getSession();

  if (session) {
    redirect('/');
  }

  return (
    <form action={logIn} className='flex flex-col gap-2'>
      <input
        type='email'
        name='email'
        placeholder='Email'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <input
        type='password'
        name='password'
        placeholder='********'
        className='rounded bg-white px-2 py-1 text-base text-black'
      />
      <button className='mt-4 rounded border-2 border-white p-1'>Login</button>
    </form>
  );
}
