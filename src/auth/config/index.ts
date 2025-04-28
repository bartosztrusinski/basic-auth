import { env } from '@/env';

const appName = env.NEXT_PUBLIC_APP_NAME ?? 'Basic Auth';

const baseUrl = env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const defaultRedirectRoute = '/';
const loginRoute = '/log-in';
const signupRoute = '/sign-up';
const resendVerificationEmailRoute = '/resend-email';
const emailVerificationRoute = '/verify-email';

const apiBaseRoute = env.NEXT_PUBLIC_API_BASE_ROUTE ?? '/api/auth';
const apiSessionEndpoint = 'session';
const apiUserEndpoint = 'user';
const apiOAuthEndpoint = 'callback';

const protectedRoutes = ['/private', '/profile', '/admin'] as const;
const authRoutes = [
  loginRoute,
  signupRoute,
  resendVerificationEmailRoute,
  emailVerificationRoute,
] as const;

const syncAuthCookieKey = 'sync-auth';
const returnBackUrlKey = 'return_back_url';
const redirectReasonKey = 'redirect_reason';
const verificationTokenKey = 'token';

// TODO
const defaultRedirectReason = 'Please log in to continue';
const logoFilename = 'basic-auth.png';

export default Object.freeze({
  baseUrl,
  appName,
  defaultRedirectRoute,
  loginRoute,
  signupRoute,
  resendVerificationEmailRoute,
  emailVerificationRoute,
  apiBaseRoute,
  apiSessionEndpoint,
  apiUserEndpoint,
  apiOAuthEndpoint,
  protectedRoutes,
  authRoutes,
  syncAuthCookieKey,
  returnBackUrlKey,
  redirectReasonKey,
  verificationTokenKey,
  defaultRedirectReason,
  logoFilename,
});
