import { redirect } from 'next/navigation';
import { auth } from '@/auth/session';
import { Page } from '@/components/page';
import { UsersList } from '@/components/users-list';

export default async function AdminPage() {
  const { userRole } = await auth();

  if (userRole !== 'admin') {
    redirect('/');
  }

  return (
    <Page>
      <Page.Title>Admin Dashboard</Page.Title>
      <Page.Description>
        This page is only accessible to administrators, users with the{' '}
        <code className='text-red-500'>admin</code> role.
      </Page.Description>
      <h2 className='pt-5 text-center text-xl font-bold'>Users in System</h2>
      <UsersList />
    </Page>
  );
}
