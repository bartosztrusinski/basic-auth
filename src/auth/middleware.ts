import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getSessionCookie, setAuthSyncCookie } from './cookie';
import { setRedirectReasonParam, setReturnBackParam } from './util';
import config from './config';

type MiddlewareAuth = {
  isAuthenticated: boolean;
  redirectToLogin: (options?: RedirectOptions) => NextResponse;
  redirectToDefault: (options?: RedirectOptions) => NextResponse;
};

type MiddlewareHandler = (
  auth: () => Promise<MiddlewareAuth>,
  request: NextRequest,
) => Promise<NextResponse | void>;

type RedirectOptions = {
  requestAuthSync?: boolean;
  redirectReason?: string;
};

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

function redirectToLogin(request: NextRequest, options: RedirectOptions = {}) {
  const { pathname } = request.nextUrl;
  const { requestAuthSync } = options;
  const redirectUrl = new URL(config.loginRoute, request.url);

  setReturnBackParam(redirectUrl, pathname);
  setRedirectReasonParam(redirectUrl, options.redirectReason);

  const response = NextResponse.redirect(redirectUrl);

  if (requestAuthSync) {
    void setAuthSyncCookie(response);
  }

  return response;
}

function redirectToDefault(request: NextRequest, options: RedirectOptions = {}) {
  const { requestAuthSync } = options;

  const response = NextResponse.redirect(new URL(config.defaultRedirectRoute, request.url));

  if (requestAuthSync) {
    void setAuthSyncCookie(response);
  }

  return response;
}
