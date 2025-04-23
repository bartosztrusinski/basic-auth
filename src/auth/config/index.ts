import { env } from '@/env';

const defaultRedirectRoute = env.NEXT_PUBLIC_DEFAULT_REDIRECT_ROUTE ?? '/';
const loginRoute = env.NEXT_PUBLIC_LOGIN_ROUTE ?? '/log-in';
const signupRoute = env.NEXT_PUBLIC_SIGNUP_ROUTE ?? '/sign-up';
const apiBaseRoute = env.NEXT_PUBLIC_API_BASE_ROUTE ?? '/api/auth';

const apiSessionEndpoint = 'session';
const apiUserEndpoint = 'user';
const apiOAuthEndpoint = 'callback';

const protectedRoutes = ['/private', '/profile', '/admin'] as const;
const authRoutes = [loginRoute, signupRoute] as const;

const returnBackUrlKey = 'return_back_url';
const redirectReasonKey = 'redirect_reason';
const defaultRedirectReason = 'Please log in to continue';
const syncAuthCookieKey = 'sync-auth';

export default Object.freeze({
  defaultRedirectRoute,
  loginRoute,
  signupRoute,
  apiBaseRoute,
  apiSessionEndpoint,
  apiUserEndpoint,
  apiOAuthEndpoint,
  protectedRoutes,
  authRoutes,
  returnBackUrlKey,
  redirectReasonKey,
  defaultRedirectReason,
  syncAuthCookieKey,
});
