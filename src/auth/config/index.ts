import { env } from '@/env';

const appName = env.NEXT_PUBLIC_APP_NAME ?? 'Basic Auth';

const baseUrl = env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const defaultRedirectRoute = env.NEXT_PUBLIC_DEFAULT_REDIRECT_ROUTE ?? '/';
const loginRoute = env.NEXT_PUBLIC_LOGIN_ROUTE ?? '/log-in';
const signupRoute = env.NEXT_PUBLIC_SIGNUP_ROUTE ?? '/sign-up';
const resendVerificationEmailRoute = env.NEXT_PUBLIC_RESEND_EMAIL_ROUTE ?? '/resend-email';
const emailVerificationRoute = env.NEXT_PUBLIC_VERIFY_EMAIL_ROUTE ?? '/verify-email';
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
