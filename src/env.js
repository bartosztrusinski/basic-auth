import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    SECRET: z.string(),
    EXPIRATION_TIME_SECONDS: z.coerce.number(),
    SESSION_COOKIE_NAME: z.string(),
  },
  client: {
    // NEXT_PUBLIC_CLIENTVAR: z.string(),
  },
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SECRET: process.env.SECRET,
    EXPIRATION_TIME_SECONDS: process.env.EXPIRATION_TIME_SECONDS,
    SESSION_COOKIE_NAME: process.env.SESSION_COOKIE_NAME,
  },
});
