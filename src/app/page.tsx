import { currentUser } from '@/auth/session';
import { Page } from '@/components/page';
import { ClientComponent } from '@/components/client-component';

export default async function HomePage() {
  const user = await currentUser();

  return (
    <Page>
      <Page.Title>🔐 Basic Auth</Page.Title>
      <Page.Description>
        Server-side: {user ? `Welcome back ${user.name}` : 'You are not logged in'}
        <ClientComponent />
      </Page.Description>
    </Page>
  );
}
