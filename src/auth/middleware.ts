import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getSessionCookie, setAuthSyncCookie } from '@/auth/cookie';
import { type RedirectToLoginOptions } from '@/auth/session';
import { type AuthCode } from '@/auth/message';
import config from '@/auth/config';

type MiddlewareAuth = {
  isAuthenticated: boolean;
  redirectToLogin: (options?: RedirectToLoginOptions) => NextResponse;
  redirectToDefault: (options?: RedirectToDefaultOptions) => NextResponse;
};

type RedirectToDefaultOptions = Omit<RedirectToLoginOptions, 'returnBackUrl'>;

type MiddlewareHandler = (
  auth: () => Promise<MiddlewareAuth>,
  request: NextRequest,
) => Promise<NextResponse | void>;

export function authMiddleware(middlewareHandler: MiddlewareHandler) {
  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const isServerAction = Boolean(request.headers.get('next-action'));

    // Skip initial authentication for server actions as redirects are not supported
    if (isServerAction) {
      return NextResponse.next();
    }

    const response = await middlewareHandler(authClosure(request), request);
    return response ?? NextResponse.next();
  };
}

const authClosure = (request: NextRequest) => async () =>
  ({
    isAuthenticated: Boolean(await getSessionCookie(request)),
    redirectToLogin: (options) => redirectToLogin(request, options),
    redirectToDefault: (options) => redirectToDefault(request, options),
  }) satisfies MiddlewareAuth;

function redirectToLogin(
  request: NextRequest,
  { returnBackUrl, authCode, syncAuth }: RedirectToLoginOptions = {},
) {
  const { pathname } = request.nextUrl;
  const redirectUrl = new URL(config.loginRoute, request.url);
  const code: AuthCode = authCode ?? 'unauthenticated';

  redirectUrl.searchParams.set(config.returnBackUrlKey, returnBackUrl ?? pathname);
  redirectUrl.searchParams.set(config.authCodeKey, code);

  const response = NextResponse.redirect(redirectUrl);

  if (syncAuth) {
    setAuthSyncCookie(response).catch(() => null);
  }

  return response;
}

function redirectToDefault(
  request: NextRequest,
  { syncAuth, authCode }: RedirectToDefaultOptions = {},
) {
  const redirectUrl = new URL(config.defaultRedirectRoute, request.url);

  if (authCode) {
    redirectUrl.searchParams.set(config.authCodeKey, authCode);
  }

  const response = NextResponse.redirect(redirectUrl);

  if (syncAuth) {
    setAuthSyncCookie(response).catch(() => null);
  }

  return response;
}
