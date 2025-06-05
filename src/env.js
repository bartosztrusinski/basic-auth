import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    DATABASE_URL: z.string().url(),
    SESSION_EXPIRATION_IN_SECONDS: z.coerce.number().optional(),
    FROM_EMAIL_ADDRESS: z.string().email().optional(),
    ENCRYPTION_KEY: z.string().base64url(),
    PEPPER: z.string().base64url(),
    RESEND_API_KEY: z.string(),
    DISCORD_CLIENT_ID: z.string(),
    DISCORD_CLIENT_SECRET: z.string(),
    GITHUB_CLIENT_ID: z.string(),
    GITHUB_CLIENT_SECRET: z.string(),
    GOOGLE_CLIENT_ID: z.string(),
    GOOGLE_CLIENT_SECRET: z.string(),
  },
  client: {
    NEXT_PUBLIC_APP_NAME: z.string().optional(),
    NEXT_PUBLIC_BASE_URL: z.string().url().optional(),
    NEXT_PUBLIC_API_BASE_ROUTE: z.string().optional(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    DATABASE_URL: process.env.DATABASE_URL,
    SESSION_EXPIRATION_IN_SECONDS: process.env.SESSION_EXPIRATION_IN_SECONDS,
    FROM_EMAIL_ADDRESS: process.env.FROM_EMAIL_ADDRESS,
    ENCRYPTION_KEY: process.env.ENCRYPTION_KEY,
    PEPPER: process.env.PEPPER,
    RESEND_API_KEY: process.env.RESEND_API_KEY,
    DISCORD_CLIENT_ID: process.env.DISCORD_CLIENT_ID,
    DISCORD_CLIENT_SECRET: process.env.DISCORD_CLIENT_SECRET,
    GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID,
    GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET,
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,

    NEXT_PUBLIC_APP_NAME: process.env.NEXT_PUBLIC_APP_NAME,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
    NEXT_PUBLIC_API_BASE_ROUTE: process.env.NEXT_PUBLIC_API_BASE_ROUTE,
  },
});
