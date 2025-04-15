import 'server-only';
import { env } from '@/env';
import config from './index';

const secureCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
};

const sessionExpirationInSeconds = env.SESSION_EXPIRATION_IN_SECONDS;
const sessionCookieKey = 'session-id';
const sessionCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

const stateExpirationInSeconds = env.OAUTH_STATE_EXPIRATION_IN_SECONDS ?? 60 * 5;
const stateCookieKey = 'oauth-state';
const stateCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: stateExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

export default Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  sessionCookieAttributes,
  stateExpirationInSeconds,
  stateCookieKey,
  stateCookieAttributes,
});
