import { auth } from '@/auth/session';
import { Page } from '@/components/page';
import { redirect } from 'next/navigation';

export default async function AdminPage() {
  const { userRole } = await auth();

  if (userRole !== 'admin') {
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
