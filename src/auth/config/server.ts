import 'server-only';
import { env } from '@/env';
import config from '@/auth/config';

const fromEmailAddress = env.FROM_EMAIL_ADDRESS ?? 'onboarding@resend.dev';

const sessionCookieKey = 'session-id';
const codeVerifierCookieKey = 'oauth-code-verifier';

const oAuthCookiesDefaultExpirationInSeconds = 60 * 5;
const sessionExpirationInSeconds = env.SESSION_EXPIRATION_IN_SECONDS ?? 60 * 60 * 24 * 7;
const verificationTokenExpirationInSeconds = 60 * 60 * 12;
const twoFactorSetupExpirationInSeconds = 60 * 5;
const twoFactorAttemptExpirationInSeconds = 60 * 5;

const secureCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax',
} as const;

const sessionCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

const oAuthCookieAttributes = {
  ...secureCookieAttributes,
  maxAge: oAuthCookiesDefaultExpirationInSeconds,
  path: `${config.apiBaseRoute}/${config.apiOAuthEndpoint}`,
};

export default Object.freeze({
  fromEmailAddress,
  sessionCookieKey,
  codeVerifierCookieKey,
  sessionExpirationInSeconds,
  verificationTokenExpirationInSeconds,
  twoFactorSetupExpirationInSeconds,
  twoFactorAttemptExpirationInSeconds,
  sessionCookieAttributes,
  oAuthCookieAttributes,
});
