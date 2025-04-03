import { redirectToLogin } from '@/auth/session';

type Props = {
  returnBackUrl?: string | URL;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectToLogin({ returnBackUrl, searchParams }: Props) {
  const url = returnBackUrl ?? (await searchParams)?.callbackUrl;

  redirectToLogin(url);

  return null;
}
