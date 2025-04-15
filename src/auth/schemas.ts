import { z } from 'zod';
import config from '@/auth/config';

const OAuthProviderEnum = z.enum(config.oAuthProviders);

const oAuthTokenSchema = z.object({
  token_type: z.string(),
  access_token: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
  scope: z.string(),
});

const discordUserSchema = z.object({
  id: z.string(),
  username: z.string(),
  global_name: z.string(),
  email: z.string().email(),
});

export { OAuthProviderEnum, oAuthTokenSchema, discordUserSchema };
