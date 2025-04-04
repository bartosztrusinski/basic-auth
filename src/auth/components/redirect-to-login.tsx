import { getReturnBackUrlFromSearchParams, redirectToLogin } from '@/auth/util';

type Props = {
  returnBackUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectToLogin({ returnBackUrl, searchParams }: Props) {
  const url =
    returnBackUrl ?? (searchParams && (await getReturnBackUrlFromSearchParams(searchParams)));

  redirectToLogin(url);

  return null;
}
