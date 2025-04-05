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
) => Promise<NextResponse | undefined>;

const authClosure = (request: NextRequest) => async () =>
  ({
    isAuthenticated: Boolean(await getSessionCookie(request)),
    redirectToLogin: () => redirectToLoginMiddleware(request),
    redirectToDefault: () => redirectToDefaultMiddleware(request),
  }) satisfies MiddlewareAuth;

export function authMiddleware(middlewareHandler: MiddlewareHandler) {
  return async function middleware(request: NextRequest): Promise<NextResponse> {
    const response = await middlewareHandler(authClosure(request), request);
    return response ?? NextResponse.next();
  };
}
