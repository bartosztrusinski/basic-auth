import { db, UserRoles } from '@/db';
import { redirectToLogin, currentUser } from '@/auth/session';
import { Protect } from '@/auth/components/protect';
import { AccountsManager } from '@/components/accounts-manager';
import { UserProfile } from '@/components/user-profile';
import { AddPasswordForm } from '@/components/add-password-form';
import { LogoutEverywhereButton } from '@/components/logout-everywhere-button';
import { DeleteUserButton } from '@/components/delete-user-button';
import { EnableTwoFactorButton } from '@/components/enable-two-factor';
import { DisableTwoFactorButton } from '@/components/disable-two-factor-button';

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirectToLogin({ returnBackUrl: '/profile' });
  }

  const accounts = await db.getUserAccounts(user.id);
  const { email, name, role } = user;

  return (
    <div className='container'>
      <h1 className='title'>Your Profile</h1>
      <Protect when={(user) => user.role !== 'admin'}>
        <p className='text-center'>
          You are logged in as <span className='font-mono text-amber-500'>admin</span>
        </p>
      </Protect>
      <div className='space-y-8 pb-4'>
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
        <Protect when={(user) => user.isTwoFactorEnabled || !user.hasPassword}>
          <section>
            <EnableTwoFactorButton />
            <p className='pt-2 text-sm text-zinc-400'>
              Enable two-factor authentication for your account
            </p>
          </section>
        </Protect>
        <Protect when={(user) => !user.isTwoFactorEnabled}>
          <section>
            <DisableTwoFactorButton />
            <p className='pt-2 text-sm text-zinc-400'>
              Disable two-factor authentication for your account
            </p>
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
      </div>
    </div>
  );
}
