import 'server-only';
import { env } from '@/env';
import config from './index';

const oAuthCookiesDefaultExpirationInSeconds = 60 * 5;
const secureCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
} as const;

const sessionExpirationInSeconds = env.SESSION_EXPIRATION_IN_SECONDS ?? 60 * 60 * 24 * 7;
const sessionCookieKey = 'session-id';
const sessionCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

const stateExpirationInSeconds = oAuthCookiesDefaultExpirationInSeconds;
const stateCookieKey = 'oauth-state';
const stateCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: stateExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

const codeVerifierExpirationInSeconds = oAuthCookiesDefaultExpirationInSeconds;
const codeVerifierCookieKey = 'oauth-code-verifier';
const codeVerifierCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: codeVerifierExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

const verificationTokenExpirationInSeconds = 60 * 60 * 12;
const fromEmailAddress = env.FROM_EMAIL_ADDRESS ?? 'onboarding@resend.dev';

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
  verificationTokenExpirationInSeconds,
  fromEmailAddress,
});
