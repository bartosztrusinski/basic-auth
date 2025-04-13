// TODO use env variables
const sessionExpirationInSeconds = 15;
const sessionCookieKey = 'session-id';
const syncAuthCookieKey = 'sync-auth';
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
const apiBaseRoute = '/api/auth';

const apiSessionEndpoint = 'session';
const apiUserEndpoint = 'user';

const protectedRoutes = ['/private', '/profile', '/admin'];
const authRoutes = [loginRoute, signupRoute];

export default Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  syncAuthCookieKey,
  sessionCookieAttributes,
  returnBackUrlKey,
  defaultRedirectRoute,
  loginRoute,
  signupRoute,
  apiBaseRoute,
  apiSessionEndpoint,
  apiUserEndpoint,
  protectedRoutes,
  authRoutes,
});
