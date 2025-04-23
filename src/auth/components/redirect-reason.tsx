import { getRedirectReasonSearchParam } from '@/auth/util';
import { Alert } from '@/components/alert';

type Props = {
  reason?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

// TODO remove
export async function RedirectReason({ reason, searchParams }: Props) {
  const redirectReason =
    reason ?? (searchParams && (await getRedirectReasonSearchParam(searchParams)));

  if (!redirectReason) {
    return null;
  }

  return <Alert variant='error' message={redirectReason} />;
}
