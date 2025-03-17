import { redirect } from 'next/navigation';
import { UserProfile } from '@/components/user-profile';
import { getSession } from '@/lib';

export default async function ProfilePage() {
  const session = await getSession();

  if (!session) {
    redirect('/login');
  }

  const { user } = session;

  return <UserProfile user={user} />;
}
