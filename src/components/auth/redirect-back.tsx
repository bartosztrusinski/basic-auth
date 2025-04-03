import { redirect, RedirectType } from 'next/navigation';

type Props = {
  callbackUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectBack({ callbackUrl, searchParams }: Props) {
  const url = callbackUrl ?? (await searchParams)?.callbackUrl;

  redirect(url ? decodeURIComponent(url) : '/', RedirectType.replace);

  return null;
}
