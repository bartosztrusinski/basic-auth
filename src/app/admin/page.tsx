import { auth } from '@/auth/session';
import { Page } from '@/components/page';
import { UsersList } from '@/components/users-list';

export default async function AdminPage() {
  await auth.protect({ role: 'admin', unauthorizedUrl: '/profile' });

  return (
    <Page>
      <Page.Title>Admin Dashboard</Page.Title>
      <Page.Description>
        This page is only accessible to administrators, users with the{' '}
        <code className='text-indigo-500'>admin</code> role.
      </Page.Description>
      <h2 className='pt-5 text-center text-xl font-bold'>Users in System</h2>
      <UsersList />
    </Page>
  );
}
