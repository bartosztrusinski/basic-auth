import { redirect, RedirectType } from 'next/navigation';

type Props = {
  returnUrl?: string | URL;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function ReturnBack({ returnUrl, searchParams }: Props) {
  const url = returnUrl ?? (await searchParams)?.callbackUrl;

  redirect(url ? decodeURIComponent(url.toString()) : '/', RedirectType.replace);

  return null;
}
