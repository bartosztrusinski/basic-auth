import 'server-only';
import { env } from '@/env';
import { discordUserSchema } from './schemas';
import { type OAuthProviderConfig } from './types';
import { z } from 'zod';

const providerConfig = {
  discord: createProvider({
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    authorizationUrl: new URL('https://discord.com/oauth2/authorize'),
    tokenUrl: new URL('https://discord.com/api/oauth2/token'),
    userUrl: new URL('https://discord.com/api/users/@me'),
    scope: ['identify', 'email'],
    userSchema: discordUserSchema,
    userMapper: (providerUser) => ({
      id: providerUser.id,
      email: providerUser.email,
      name: providerUser.username,
    }),
  }),
} satisfies Record<string, OAuthProviderConfig>;

const OAuthProviderEnum = z.enum(Object.keys(providerConfig) as [keyof typeof providerConfig]);

function createProvider<Schema extends z.ZodSchema>(providerConfig: OAuthProviderConfig<Schema>) {
  return providerConfig;
}

export default Object.freeze(providerConfig);
export { OAuthProviderEnum };
