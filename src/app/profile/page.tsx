import { getUserSession } from '@/auth/session';
import { UserProfile } from '@/components/user-profile';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const user = await getUserSession();

  if (!user) {
    redirect('/log-in');
  }

  return <UserProfile user={user} />;
}
