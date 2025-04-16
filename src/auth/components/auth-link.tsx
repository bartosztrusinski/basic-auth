import { type AnchorHTMLAttributes } from 'react';
import Link, { type LinkProps } from 'next/link';
import { getReturnBackSearchParam } from '../util';
import config from '../config';

type AuthProps = LinkProps &
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    returnBackUrl?: string;
    searchParams?: Promise<Record<string, string | undefined>>;
  };

type Props = Omit<AuthProps, 'href'>;

function AuthLink({ returnBackUrl, searchParams, href, ...props }: AuthProps) {
  if (searchParams) {
    return <AuthLinkAsync {...props} href={href} searchParams={searchParams} />;
  }

  if (returnBackUrl) {
    return (
      <Link
        {...props}
        href={{ pathname: href, query: { [config.returnBackUrlKey]: returnBackUrl } }}
      />
    );
  }

  return <Link {...props} href={href} />;
}

async function AuthLinkAsync({ searchParams, href, ...props }: AuthProps) {
  const returnBackUrl = await getReturnBackSearchParam(searchParams);

  if (!returnBackUrl) {
    return <Link {...props} href={href} />;
  }

  return (
    <Link
      {...props}
      href={{ pathname: href, query: { [config.returnBackUrlKey]: returnBackUrl } }}
    />
  );
}

export function LoginLink(props: Props) {
  return <AuthLink {...props} href={config.loginRoute} />;
}

export function SignupLink(props: Props) {
  return <AuthLink {...props} href={config.signupRoute} />;
}
