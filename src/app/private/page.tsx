import { LoggedOut } from '@/components/auth/logged-out';
import { RedirectToLogin } from '@/components/auth/redirect-to-login';
import { Page } from '@/components/page';

export default async function PrivatePage() {
  return (
    <>
      <LoggedOut>
        <RedirectToLogin callbackUrl='/private' />
      </LoggedOut>
      <Page>
        <Page.Title>Private</Page.Title>
        <Page.Description>This page is only accessible to authenticated users.</Page.Description>
      </Page>
    </>
  );
}
