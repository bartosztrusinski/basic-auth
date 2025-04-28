import { db } from '@/db';
import { auth, currentUser } from '@/auth/session';
import { getAuthCode, getAuthMessage } from '@/auth/message';
import { Protect } from '@/auth/components/protect';
import { LinkedAccounts } from '@/auth/components/linked-accounts';
import { UserProfile } from '@/components/user-profile';
import { Page } from '@/components/page';
import { Alert } from '@/components/alert';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { redirectToLogin } = await auth();
  const user = await currentUser();

  if (!user) {
    return redirectToLogin({ returnBackUrl: '/profile' });
  }

  const accounts = await db.getUserAccounts(user.id);
  const { email, name, role } = user;
  const authCode = await getAuthCode(searchParams);
  const authMessage = authCode ? getAuthMessage(authCode) : null;

  return (
    <Page>
      <Page.Title>Your Profile</Page.Title>
      <Protect role='admin'>
        <Page.Description>
          <span className='text-zinc-400'>
            You are logged in as an <code className='text-indigo-500'>admin</code>.
          </span>
        </Page.Description>
      </Protect>
      <UserProfile user={{ name, email, role }} />
      <h2 className='pt-4 text-center text-2xl font-bold'>Linked Accounts</h2>
      {authMessage && <Alert variant={authMessage.type} message={authMessage.message} />}
      <LinkedAccounts accounts={accounts} />
    </Page>
  );
}
