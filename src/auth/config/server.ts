import 'server-only';
import { env } from '@/env';

const sessionExpirationInSeconds = env.SESSION_EXPIRATION_IN_SECONDS;
const sessionCookieKey = 'session-id';
const sessionCookieAttributes = {
  secure: true,
  httpOnly: true,
  sameSite: 'lax' as const,
  maxAge: sessionExpirationInSeconds,
  path: '/',
};

export default Object.freeze({
  sessionExpirationInSeconds,
  sessionCookieKey,
  sessionCookieAttributes,
});
