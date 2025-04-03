import { getCurrentUser } from '@/auth/session';
import { Page } from '@/components/page';

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <Page>
      <Page.Title>🔐 Basic Auth</Page.Title>
      <Page.Description>
        {user ? `Welcome back ${user.name}` : 'You are not logged in'}
      </Page.Description>
    </Page>
  );
}
