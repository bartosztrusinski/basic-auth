import { auth, currentUser } from '@/auth/session';
import { Protect } from '@/auth/components/protect';
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
      <Protect role='admin'>
        <Page.Description>
          <span className='text-zinc-400'>
            You are logged in as an <code className='text-red-500'>admin</code>.
          </span>
        </Page.Description>
      </Protect>
      <UserProfile user={{ name, email, role }} />
    </Page>
  );
}
