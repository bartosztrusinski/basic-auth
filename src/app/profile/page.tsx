import { db, UserRoles } from '@/db';
import { auth, currentUser } from '@/auth/session';
import { getAuthCode } from '@/auth/message';
import { Protect } from '@/auth/components/protect';
import { AccountsManager } from '@/components/accounts-manager';
import { UserProfile } from '@/components/user-profile';
import { Page } from '@/components/page';
import { AuthAlert } from '@/components/auth-alert';
import { AddPasswordForm } from '@/components/add-password-form';
import { LogoutEverywhereButton } from '@/components/logout-everywhere-button';
import { DeleteUserButton } from '@/components/delete-user-button';

export default async function ProfilePage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const { redirectToLogin } = await auth();
  const user = await currentUser();
  const authCode = await getAuthCode(searchParams);

  if (!user) {
    return redirectToLogin({ returnBackUrl: '/profile' });
  }

  const accounts = await db.getUserAccounts(user.id);
  const { email, name, role } = user;

  return (
    <Page>
      <Page.Title>Your Profile</Page.Title>
      <Protect when={(user) => user.role !== 'admin'}>
        <Page.Description>
          <span className='text-zinc-400'>
            You are logged in as an <code className='text-indigo-500'>admin</code>.
          </span>
        </Page.Description>
      </Protect>
      <AuthAlert authCode={authCode} />
      <article className='space-y-8 pb-4'>
        <section>
          <UserProfile user={{ name, email, role }} roles={UserRoles} />
          <p className='pt-2 text-sm text-zinc-400'>View and update your profile information</p>
        </section>
        <section className='space-y-3'>
          <AccountsManager accounts={accounts} />
          <p className='text-sm text-zinc-400'>View and manage your connected accounts</p>
        </section>
        <Protect when={(user) => user.hasPassword}>
          <section>
            <AddPasswordForm email={user.email} />
            <p className='pt-2 text-sm text-zinc-400'>Set a password for your account</p>
          </section>
        </Protect>
        <section>
          <LogoutEverywhereButton />
          <p className='pt-2 text-sm text-zinc-400'>
            This will log you out from all devices and sessions
          </p>
        </section>
        <section>
          <DeleteUserButton />
          <p className='pt-2 text-sm text-zinc-400'>
            This action is irreversible and will delete all your data
          </p>
        </section>
      </article>
    </Page>
  );
}
