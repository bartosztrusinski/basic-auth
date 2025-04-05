import 'server-only';

const sessionExpirationInSeconds = 60;
const sessionCookieKey = 'session-id';
const sessionCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

const returnBackUrlKey = 'return_back_url';
const defaultRedirectRoute = '/';
const loginRoute = '/log-in';
const signupRoute = '/sign-up';

const protectedRoutes = ['/private', '/profile', '/admin'];
const authRoutes = [loginRoute, signupRoute];

const authConfig = Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  sessionCookieAttributes,
  returnBackUrlKey,
  defaultRedirectRoute,
  loginRoute,
  signupRoute,
  protectedRoutes,
  authRoutes,
});

export default authConfig;
