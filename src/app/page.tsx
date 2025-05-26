import Image from 'next/image';
import { currentUser } from '@/auth/session';
import { Page } from '@/components/page';
import { ClientComponent } from '@/components/client-component';

export default async function HomePage() {
  const user = await currentUser();

  return (
    <Page>
      <Page.Title>
        <Image src='/logo.png' alt='App logo' width={48} height={48} className='inline-block' />
        <span className='align-middle'>Basic Auth</span>
      </Page.Title>
      <Page.Description>
        <span className='pr-2 font-medium text-amber-500'>Server</span>
        {user ? `Welcome ${user.name}` : 'You are not logged in'}
        <ClientComponent />
      </Page.Description>
    </Page>
  );
}
