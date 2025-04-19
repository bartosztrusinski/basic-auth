import 'server-only';
import { z } from 'zod';
import { env } from '@/env';
import { discordUserSchema, githubUserSchema } from './schemas';
import { type OAuthProviderConfig } from './types';

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
  github: createProvider({
    clientId: env.GITHUB_CLIENT_ID,
    clientSecret: env.GITHUB_CLIENT_SECRET,
    authorizationUrl: new URL('https://github.com/login/oauth/authorize'),
    tokenUrl: new URL('https://github.com/login/oauth/access_token'),
    userUrl: new URL('https://api.github.com/user'),
    scope: ['read:user', 'user:email'],
    userSchema: githubUserSchema,
    userMapper: (providerUser) => ({
      id: providerUser.id.toString(),
      email: providerUser.email,
      name: providerUser.name ?? providerUser.login,
    }),
  }),
} satisfies Record<string, OAuthProviderConfig>;

const OAuthProviderEnum = z.enum(Object.keys(providerConfig) as [keyof typeof providerConfig]);

function createProvider<Schema extends z.ZodSchema>(providerConfig: OAuthProviderConfig<Schema>) {
  return providerConfig;
}

export default Object.freeze(providerConfig);
export { OAuthProviderEnum };
