import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    SESSION_EXPIRATION_IN_SECONDS: z.coerce.number(),
    OAUTH_STATE_EXPIRATION_IN_SECONDS: z.coerce.number().optional(),
    OAUTH_CODE_VERIFIER_EXPIRATION_IN_SECONDS: z.coerce.number().optional(),
    BASE_URL: z.string().url(),
    RESEND_API_KEY: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_DEFAULT_REDIRECT_ROUTE: z.string().optional(),
    NEXT_PUBLIC_LOGIN_ROUTE: z.string().optional(),
    NEXT_PUBLIC_SIGNUP_ROUTE: z.string().optional(),
    NEXT_PUBLIC_API_BASE_ROUTE: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SESSION_EXPIRATION_IN_SECONDS: process.env.SESSION_EXPIRATION_IN_SECONDS,
    OAUTH_STATE_EXPIRATION_IN_SECONDS: process.env.OAUTH_STATE_EXPIRATION_IN_SECONDS,
    OAUTH_CODE_VERIFIER_EXPIRATION_IN_SECONDS:
      process.env.OAUTH_CODE_VERIFIER_EXPIRATION_IN_SECONDS,
    BASE_URL: process.env.BASE_URL,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXT_PUBLIC_DEFAULT_REDIRECT_ROUTE: process.env.NEXT_PUBLIC_DEFAULT_REDIRECT_ROUTE,
    NEXT_PUBLIC_LOGIN_ROUTE: process.env.NEXT_PUBLIC_LOGIN_ROUTE,
    NEXT_PUBLIC_SIGNUP_ROUTE: process.env.NEXT_PUBLIC_SIGNUP_ROUTE,
    NEXT_PUBLIC_API_BASE_ROUTE: process.env.NEXT_PUBLIC_API_BASE_ROUTE,
  },
});
