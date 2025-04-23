import { getAccountLinkErrorSearchParam } from '@/auth/util';
import { ErrorAlert } from '@/components/error-alert';

type Props = {
  error?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function AccountLinkError({ error, searchParams }: Props) {
  // TODO search params should be a code, show a message based on the reason code
  const accountLinkError =
    error ?? (searchParams && (await getAccountLinkErrorSearchParam(searchParams)));

  if (!accountLinkError) {
    return null;
  }

  return <ErrorAlert error={accountLinkError} />;
}
