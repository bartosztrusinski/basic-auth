import { type HTMLProps } from 'react';
import Link, { type LinkProps } from 'next/link';
import { createReturnBackSearchParam, getReturnBackUrlFromSearchParams } from '@/auth/util';

type AuthProps = {
  returnBackUrl?: string | URL;
  searchParams?: Promise<Record<string, string | undefined>>;
};

type Props = Omit<LinkProps & HTMLProps<HTMLAnchorElement>, 'href'> & AuthProps;

async function AuthLink({ returnBackUrl, searchParams, href, ...props }: Props & { href: string }) {
  const url =
    returnBackUrl ?? (searchParams && (await getReturnBackUrlFromSearchParams(searchParams)));

  return <Link {...props} href={href + createReturnBackSearchParam(url)} />;
}

export async function LoginLink(props: Props) {
  return <AuthLink {...props} href='/log-in' />;
}

export async function SignupLink(props: Props) {
  return <AuthLink {...props} href='/sign-up' />;
}
