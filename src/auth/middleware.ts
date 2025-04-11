import 'server-only';
import { type NextRequest, NextResponse } from 'next/server';
import { getSessionCookie } from './cookie';
import { redirectToDefaultMiddleware, redirectToLoginMiddleware } from './util';

type MiddlewareAuth = {
  isAuthenticated: boolean;
  redirectToLogin: () => NextResponse;
  redirectToDefault: () => NextResponse;
};

type MiddlewareHandler = (
  auth: () => Promise<MiddlewareAuth>,
  request: NextRequest,
) => Promise<NextResponse | void>;

const authClosure = (request: NextRequest) => async () =>
  ({
    isAuthenticated: Boolean(await getSessionCookie(request)),
    redirectToLogin: () => redirectToLoginMiddleware(request),
    redirectToDefault: () => redirectToDefaultMiddleware(request),
  }) satisfies MiddlewareAuth;

export function authMiddleware(middlewareHandler: MiddlewareHandler) {
  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const isServerAction = request.headers.get('next-action');

    // Skip initial authentication for server actions as redirects are not supported
    if (isServerAction) {
      return NextResponse.next();
    }

    const response = await middlewareHandler(authClosure(request), request);
    return response ?? NextResponse.next();
  };
}
