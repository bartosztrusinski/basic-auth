import { getUserSession } from '@/auth/session';
import { Page } from '@/components/page';

export default async function HomePage() {
  const user = await getUserSession();

  return (
    <Page>
      <Page.Title>Basic Auth</Page.Title>
      <Page.Description>
        {user ? `Welcome back ${user.id}!` : 'You are not logged in'}
      </Page.Description>
    </Page>
  );
}
