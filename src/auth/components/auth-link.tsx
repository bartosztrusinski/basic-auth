import { type AnchorHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import { createReturnBackSearchParam, getReturnBackSearchParam } from '../util';
import config from '../config';

type AuthProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    returnBackUrl?: string;
    searchParams?: Promise<Record<string, string | undefined>>;
  };

type Props = Omit<AuthProps, 'href'>;

function AuthLink({ returnBackUrl, searchParams, href, ...props }: AuthProps) {
  if (!searchParams) {
    return <Link {...props} href={href + createReturnBackSearchParam(returnBackUrl)} />;
  }

  return <AuthLinkAsync {...props} href={href} searchParams={searchParams} />;
}

async function AuthLinkAsync({ searchParams, href, ...props }: AuthProps) {
  const returnBackUrl = await getReturnBackSearchParam(searchParams);

  return <Link {...props} href={href + createReturnBackSearchParam(returnBackUrl)} />;
}

export function LoginLink(props: Props) {
  return <AuthLink {...props} href={config.loginRoute} />;
}

export function SignupLink(props: Props) {
  return <AuthLink {...props} href={config.signupRoute} />;
}
