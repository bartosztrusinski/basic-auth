import { getUserSession } from '@/auth/session';
import { Page } from '@/components/page';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const user = await getUserSession();

  if (user?.role !== 'admin') {
    redirect('/');
  }

  return (
    <Page>
      <Page.Title>Admin Dashboard</Page.Title>
      <Page.Description>
        This page is only accessible to administrators, users with the <code>admin</code> role.
      </Page.Description>
    </Page>
  );
}
