import { auth, currentUser } from '@/auth/session';
import { UserProfile } from '@/components/user-profile';
import { Page } from '@/components/page';

export default async function ProfilePage() {
  const { redirectToLogin } = await auth();
  const user = await currentUser();

  if (!user) {
    return redirectToLogin('/profile');
  }

  const { email, name, role } = user;

  return (
    <Page>
      <Page.Title>Your Profile</Page.Title>
      <UserProfile user={{ name, email, role }} />
    </Page>
  );
}
