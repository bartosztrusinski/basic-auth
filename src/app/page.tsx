import Image from 'next/image';
import { currentUser } from '@/auth/session';
import { ClientComponent } from '@/components/client-component';

export default async function HomePage() {
  const user = await currentUser();

  return (
    <div className='container'>
      <h1 className='title'>
        <Image src='/logo.png' alt='App logo' width={48} height={48} className='inline-block' />
        <span className='align-middle'>Basic Auth</span>
      </h1>
      <p className='text-center'>
        <span className='pr-2 font-medium text-amber-500'>Server</span>
        {user ? `Welcome ${user.name}` : 'You are not logged in'}
        <ClientComponent />
      </p>
    </div>
  );
}
