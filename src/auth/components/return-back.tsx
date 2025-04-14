import { redirect, RedirectType } from 'next/navigation';
import { getReturnBackSearchParam } from '../util';
import config from '../config';

type Props = {
  returnUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function ReturnBack({ returnUrl, searchParams }: Props) {
  const url = returnUrl ?? (searchParams && (await getReturnBackSearchParam(searchParams)));

  redirect(url ? decodeURIComponent(url) : config.defaultRedirectRoute, RedirectType.replace);

  return null;
}
