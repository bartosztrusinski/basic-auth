import { LoggedOut } from '@/auth/components/logged-out';
import { RedirectToLogin } from '@/auth/components/redirect-to-login';
import { Page } from '@/components/page';

export default async function PrivatePage() {
  return (
    <>
      <LoggedOut>
        <RedirectToLogin returnBackUrl='/private' />
      </LoggedOut>
      <Page>
        <Page.Title>Private</Page.Title>
        <Page.Description>This page is only accessible to authenticated users.</Page.Description>
      </Page>
    </>
  );
}
