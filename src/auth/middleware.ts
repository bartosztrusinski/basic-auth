import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getSessionCookie, setAuthSyncCookie } from '@/auth/cookie';
import { type redirectToLogin as redirectToLoginUtil } from '@/auth/util';
import config from '@/auth/config';

type MiddlewareAuth = {
  isAuthenticated: boolean;
  redirectToLogin: (options?: RedirectToLoginOptions) => NextResponse;
  redirectToDefault: (options?: RedirectOptions) => NextResponse;
};

type RedirectToLoginOptions = RedirectOptions & Parameters<typeof redirectToLoginUtil>[0];

type RedirectOptions = {
  requestAuthSync?: boolean;
};

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
  { requestAuthSync, returnBackUrl, authCode }: RedirectToLoginOptions = {},
) {
  const { pathname } = request.nextUrl;
  const redirectUrl = new URL(config.loginRoute, request.url);

  redirectUrl.searchParams.set(config.returnBackUrlKey, returnBackUrl ?? pathname);
  redirectUrl.searchParams.set(config.authCodeKey, authCode ?? 'unauthenticated');

  const response = NextResponse.redirect(redirectUrl);

  if (requestAuthSync) {
    void setAuthSyncCookie(response);
  }

  return response;
}

function redirectToDefault(request: NextRequest, { requestAuthSync }: RedirectOptions = {}) {
  const response = NextResponse.redirect(new URL(config.defaultRedirectRoute, request.url));

  if (requestAuthSync) {
    void setAuthSyncCookie(response);
  }

  return response;
}
