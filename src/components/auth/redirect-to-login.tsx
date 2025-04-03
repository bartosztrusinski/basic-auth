import { redirect, RedirectType } from 'next/navigation';

type Props = {
  callbackUrl?: string;
  searchParams?: Promise<Record<string, string | undefined>>;
};

export async function RedirectToLogin({ callbackUrl, searchParams }: Props) {
  const url = callbackUrl ?? (await searchParams)?.callbackUrl;

  redirect(`/log-in${url ? `?callbackUrl=${encodeURIComponent(url)}` : ''}`, RedirectType.replace);

  return null;
}
