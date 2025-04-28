import { getSearchParam, redirectToLogin } from '../util';
import config from '../config';

type Props = {
  returnBackUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectToLogin({ returnBackUrl, searchParams }: Props) {
  const url =
    returnBackUrl ??
    (searchParams && (await getSearchParam(searchParams, config.returnBackUrlKey)));

  redirectToLogin({ returnBackUrl: url });

  return null;
}
