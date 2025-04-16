import { getRedirectReasonSearchParam } from '@/auth/util';

type Props = {
  reason?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectReason({ reason, searchParams }: Props) {
  const redirectReason =
    reason ?? (searchParams && (await getRedirectReasonSearchParam(searchParams)));

  if (!redirectReason) {
    return null;
  }

  return <p className='text-sm font-light text-red-500'>{redirectReason}</p>;
}
