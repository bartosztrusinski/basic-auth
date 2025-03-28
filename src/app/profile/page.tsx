import { auth } from '@/auth';
import { UserProfile } from '@/components/user-profile';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const session = await auth();

  if (!session) {
    redirect('/');
  }

  return <UserProfile />;
}
