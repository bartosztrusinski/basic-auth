import 'server-only';
import { env } from '@/env';
import config from './index';

const oAuthCookiesDefaultExpirationInSeconds = 60 * 5;
const secureCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
} as const;

const sessionExpirationInSeconds = env.SESSION_EXPIRATION_IN_SECONDS;
const sessionCookieKey = 'session-id';
const sessionCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

const stateExpirationInSeconds =
  env.OAUTH_STATE_EXPIRATION_IN_SECONDS ?? oAuthCookiesDefaultExpirationInSeconds;
const stateCookieKey = 'oauth-state';
const stateCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: stateExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

const codeVerifierExpirationInSeconds =
  env.OAUTH_CODE_VERIFIER_EXPIRATION_IN_SECONDS ?? oAuthCookiesDefaultExpirationInSeconds;
const codeVerifierCookieKey = 'oauth-code-verifier';
const codeVerifierCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: codeVerifierExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

export default Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  sessionCookieAttributes,
  stateExpirationInSeconds,
  stateCookieKey,
  stateCookieAttributes,
  codeVerifierExpirationInSeconds,
  codeVerifierCookieKey,
  codeVerifierCookieAttributes,
});
