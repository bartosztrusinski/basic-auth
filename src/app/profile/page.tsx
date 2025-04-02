import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/auth/session';
import { UserProfile } from '@/components/user-profile';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect('/log-in?callbackUrl=/profile');
  }

  return <UserProfile user={user} />;
}
