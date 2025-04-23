import { getRedirectReasonSearchParam } from '@/auth/util';
import { ErrorAlert } from '@/components/error-alert';

type Props = {
  reason?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectReason({ reason, searchParams }: Props) {
  // TODO search params should be a code, show a message based on the reason code
  const redirectReason =
    reason ?? (searchParams && (await getRedirectReasonSearchParam(searchParams)));

  if (!redirectReason) {
    return null;
  }

  return <ErrorAlert error={redirectReason} />;
}
