import { redirect } from 'next/navigation';
import { getCurrentUser } from '@/auth/session';
import { UserProfile } from '@/components/user-profile';
import { Page } from '@/components/page';

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect(`/log-in?callbackUrl=${encodeURIComponent('/profile')}`);
  }

  return (
    <Page>
      <Page.Title>Your Profile</Page.Title>
      <UserProfile user={user} />
    </Page>
  );
}
