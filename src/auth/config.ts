// TODO use env variables
const sessionExpirationInSeconds = 15;
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
const apiRoute = '/api/auth';

const protectedRoutes = ['/private', '/profile', '/admin'];
const authRoutes = [loginRoute, signupRoute];

export default Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  sessionCookieAttributes,
  returnBackUrlKey,
  defaultRedirectRoute,
  loginRoute,
  signupRoute,
  apiRoute,
  protectedRoutes,
  authRoutes,
});
