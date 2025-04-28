import { redirect, RedirectType } from 'next/navigation';
import { getSearchParam } from '../util';
import config from '../config';

type Props = {
  returnUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function ReturnBack({ returnUrl, searchParams }: Props) {
  const url = returnUrl ?? (await getSearchParam(searchParams, config.returnBackUrlKey));

  redirect(url ?? config.defaultRedirectRoute, RedirectType.replace);

  return null;
}
