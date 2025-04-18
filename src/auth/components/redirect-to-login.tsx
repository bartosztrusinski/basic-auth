import { getReturnBackSearchParam, redirectToLogin } from '../util';

type Props = {
  returnBackUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectToLogin({ returnBackUrl, searchParams }: Props) {
  const url = returnBackUrl ?? (searchParams && (await getReturnBackSearchParam(searchParams)));

  redirectToLogin({ returnBackUrl: url });

  return null;
}
