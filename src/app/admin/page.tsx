import { auth } from '@/auth/session';
import { Page } from '@/components/page';
import { UsersList } from '@/components/users-list';

export default async function AdminPage() {
  await auth.protect({ role: 'admin', unauthorizedUrl: '/profile' });

  return (
    <Page>
      <Page.Title>Admin Dashboard</Page.Title>
      <Page.Description>This page is accessible only to administrators</Page.Description>
      <section>
        <h2 className='mb-2 text-lg font-medium'>Users in the System</h2>
        <UsersList />
      </section>
    </Page>
  );
}
