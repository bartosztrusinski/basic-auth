import { env } from '@/env';

const appName = env.NEXT_PUBLIC_APP_NAME ?? 'Basic Auth';

const baseUrl = env.NEXT_PUBLIC_BASE_URL ?? 'http://localhost:3000';
const defaultRedirectRoute = '/';
const loginRoute = '/log-in';
const emailVerificationRoute = '/verify-email';

const apiBaseRoute = env.NEXT_PUBLIC_API_BASE_ROUTE ?? '/api/auth';
const apiSessionEndpoint = 'session';
const apiUserEndpoint = 'user';
const apiOAuthEndpoint = 'callback';

const protectedRoutes = ['/private', '/profile', '/admin'] as const;
const authRoutes = [loginRoute, emailVerificationRoute, '/sign-up', '/resend-email'] as const;

const syncAuthCookieKey = 'sync-auth';
const returnBackUrlKey = 'return-back-url';
const verificationTokenKey = 'token';
const authCodeKey = 'auth-code';

const codeAllowedCharacters = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';
const recoveryCodeLength = 12;

const logoFilename = 'logo.png';

export default Object.freeze({
  appName,
  baseUrl,
  defaultRedirectRoute,
  loginRoute,
  emailVerificationRoute,
  apiBaseRoute,
  apiSessionEndpoint,
  apiUserEndpoint,
  apiOAuthEndpoint,
  protectedRoutes,
  authRoutes,
  syncAuthCookieKey,
  returnBackUrlKey,
  verificationTokenKey,
  authCodeKey,
  codeAllowedCharacters,
  recoveryCodeLength,
  logoFilename,
});
