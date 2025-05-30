import { auth } from '@/auth/session';
import { UsersList } from '@/components/users-list';

export default async function AdminPage() {
  await auth.protect({ role: 'admin', unauthorizedUrl: '/profile', returnBackUrl: '/admin' });

  return (
    <div className='container'>
      <h1 className='title'>Admin Dashboard</h1>
      <p className='text-center'>This page is accessible only to administrators</p>
      <section>
        <h2 className='mb-2 text-lg font-medium'>Users in the System</h2>
        <UsersList />
      </section>
    </div>
  );
}
