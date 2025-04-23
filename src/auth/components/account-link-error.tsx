import { getAccountLinkErrorSearchParam } from '@/auth/util';
import { Alert } from '@/components/alert';

type Props = {
  error?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

// TODO remove
export async function AccountLinkError({ error, searchParams }: Props) {
  const accountLinkError =
    error ?? (searchParams && (await getAccountLinkErrorSearchParam(searchParams)));

  if (!accountLinkError) {
    return null;
  }

  return <Alert variant='error' message={accountLinkError} />;
}
