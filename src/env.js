import { createEnv } from '@t3-oss/env-nextjs';
import { z } from 'zod';

export const env = createEnv({
  server: {
    NODE_ENV: z.enum(['development', 'test', 'production']),
    SESSION_EXPIRATION_IN_SECONDS: z.coerce.number(),
  },
  client: {},
  runtimeEnv: {
    NODE_ENV: process.env.NODE_ENV,
    SESSION_EXPIRATION_IN_SECONDS: process.env.SESSION_EXPIRATION_IN_SECONDS,
  },
});
