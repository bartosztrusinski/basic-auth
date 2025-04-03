import { Page } from '@/components/page';

export default function AboutPage() {
  return (
    <Page>
      <Page.Title>About</Page.Title>
      <Page.Description>
        This is a public route that can be accessed by anyone. It does not require authentication.
      </Page.Description>
    </Page>
  );
}
