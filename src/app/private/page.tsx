import { getUserSession } from '@/auth/session';
import { Page } from '@/components/page';
import { redirect } from 'next/navigation';

export default async function PrivatePage() {
  const user = await getUserSession();

  if (!user) {
    redirect('/log-in?callbackUrl=/private');
  }

  return (
    <Page>
      <Page.Title>Private</Page.Title>
      <Page.Description>This page is only accessible to authenticated users.</Page.Description>
    </Page>
  );
}
