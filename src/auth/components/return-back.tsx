import { getReturnBackUrlFromSearchParams } from '@/auth/util';
import { redirect, RedirectType } from 'next/navigation';

type Props = {
  returnUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function ReturnBack({ returnUrl, searchParams }: Props) {
  const url = returnUrl ?? (searchParams && (await getReturnBackUrlFromSearchParams(searchParams)));

  redirect(url ? decodeURIComponent(url) : '/', RedirectType.replace);

  return null;
}
