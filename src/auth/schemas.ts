import { z } from 'zod';
import serverConfig from './config/server';

const OAuthProviderEnum = z.enum(serverConfig.oAuthProviders);

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
