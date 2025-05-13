import { getSearchParam } from '@/auth/util';
import { redirectToLogin, type RedirectToLoginOptions } from '@/auth/session';
import config from '@/auth/config';

type Props = {
  searchParams?: Promise<Record<string, string | undefined>>;
} & Omit<RedirectToLoginOptions, 'syncAuth'>;

export async function RedirectToLogin({ returnBackUrl, searchParams, ...props }: Props) {
  const url =
    returnBackUrl ??
    (searchParams && (await getSearchParam(searchParams, config.returnBackUrlKey)));

  redirectToLogin({ ...props, returnBackUrl: url });

  return null;
}
