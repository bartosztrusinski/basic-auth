import { type z } from 'zod';
import { env } from '@/env';
import { type OAuthUser, type OAuthProvider } from '../oauth';
import { discordUserSchema } from '../schemas';

type ProviderBase = {
  clientId: string;
  clientSecret: string;
  authorizationUrl: URL;
  tokenUrl: URL;
  userUrl: URL;
  scope: string[];
};

type ProviderUser<Schema extends z.ZodSchema = z.ZodSchema> = {
  userSchema: Schema;
  userMapper: (providerUser: z.infer<Schema>) => OAuthUser;
};

function createProvider<Schema extends z.ZodSchema>(config: ProviderBase & ProviderUser<Schema>) {
  return config;
}

export default Object.freeze({
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
}) satisfies Record<OAuthProvider, ProviderBase & ProviderUser>;
