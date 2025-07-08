import { getUserLinkedProviders } from '@/data/account';
import { UserRoles } from '@/data/user';
import { redirectToLogin, currentUser } from '@/auth/session';
import { Protect } from '@/auth/components/protect';
import { OAuthAccountsManager } from '@/components/oauth/oauth-accounts-manager';
import { UserProfile } from '@/components/user-profile';
import { AddPasswordModal } from '@/components/add-password/add-password-modal';
import { EnableTwoFactorModal } from '@/components/two-factor/enable-two-factor-modal';
import { DisableTwoFactorModal } from '@/components/two-factor/disable-two-factor-modal';
import { LogoutEverywhereModal } from '@/components/logout/logout-everywhere-modal';
import { DeleteUserModal } from '@/components/delete-user/delete-user-modal';

export const metadata = {
  title: 'Profile',
  description: 'Manage your profile and account settings',
};

export default async function ProfilePage() {
  const user = await currentUser();

  if (!user) {
    redirectToLogin({ returnBackUrl: '/profile' });
  }

  const linkedProviders = await getUserLinkedProviders(user.id);
  const { email, name, role } = user;

  return (
    <div className='container grid max-w-3xl grid-flow-row justify-center gap-5 md:grid-cols-2'>
      <div className='col-span-full space-y-2'>
        <h1 className='title'>Your Profile</h1>
        <p className='text-center'>
          Manage profile and account settings here
          <Protect when={(user) => user.role !== 'admin'}>
            <br />
            You are logged in as <span className='font-mono text-primary-500'>admin</span>
          </Protect>
        </p>
      </div>
      <article className='top-2 space-y-2 self-start md:sticky'>
        <h2 className='text-xl font-bold'>Profile</h2>
        <UserProfile user={{ name, email, role }} roles={UserRoles} />
        <p className='text-sm text-neutral-400'>View and update your profile information</p>
      </article>
      <article>
        <h2 className='mb-2 text-xl font-bold'>Settings</h2>
        <div className='space-y-8'>
          <section>
            <div className='space-y-3'>
              <OAuthAccountsManager linkedProviders={linkedProviders} redirectUrl='/profile' />
            </div>
            <p className='pt-2 text-sm text-neutral-400'>View and manage your connected accounts</p>
          </section>
          <Protect when={(user) => user.hasPassword}>
            <section>
              <AddPasswordModal email={user.email} />
              <p className='pt-2 text-sm text-neutral-400'>Set a password for your account</p>
            </section>
          </Protect>
          <Protect when={(user) => user.isTwoFactorEnabled || !user.hasPassword}>
            <section>
              <EnableTwoFactorModal />
              <p className='pt-2 text-sm text-neutral-400'>
                Enable Two-Factor authentication for your account
              </p>
            </section>
          </Protect>
          <Protect when={(user) => !user.isTwoFactorEnabled}>
            <section>
              <DisableTwoFactorModal />
              <p className='pt-2 text-sm text-neutral-400'>
                Disable Two-Factor authentication for your account
              </p>
            </section>
          </Protect>
          <section>
            <LogoutEverywhereModal />
            <p className='pt-2 text-sm text-neutral-400'>
              This will log you out from all devices and sessions
            </p>
          </section>
          <section>
            <DeleteUserModal />
            <p className='pt-2 text-sm text-neutral-400'>
              This action is irreversible and will delete all your data
            </p>
          </section>
        </div>
      </article>
    </div>
  );
}
