import { LoggedOut } from '@/auth/components/logged-out';
import { RedirectToLogin } from '@/auth/components/redirect-to-login';

export const metadata = {
  title: 'Private',
  description: 'Page only accessible to authenticated users',
};

export default async function PrivatePage() {
  return (
    <>
      <LoggedOut>
        <RedirectToLogin returnBackUrl='/private' />
      </LoggedOut>
      <div className='container'>
        <h1 className='title'>Private</h1>
        <p className='text-center'>This page is only accessible to authenticated users.</p>
      </div>
    </>
  );
}
