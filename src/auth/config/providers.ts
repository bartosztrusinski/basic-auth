import 'server-only';
import { z } from 'zod';
import { env } from '@/env';
import { discordUserSchema, githubUserSchema, googleUserSchema } from '@/auth/schemas';
import { type OAuthUser } from '@/auth/oauth';

type OAuthProviderConfig<Schema extends z.ZodSchema = z.ZodSchema> = {
  name: string;
  clientId: string;
  clientSecret: string;
  authorizationUrl: URL;
  tokenUrl: URL;
  userUrl: URL;
  scope: string[];
} & OAuthProviderUser<Schema>;

type OAuthProviderUser<Schema extends z.ZodSchema> = {
  userSchema: Schema;
  userMapper: (providerUser: z.infer<Schema>) => OAuthUser;
};

const providerConfig = {
  discord: createProvider({
    name: 'Discord',
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
    name: 'GitHub',
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
  google: createProvider({
    name: 'Google',
    clientId: env.GOOGLE_CLIENT_ID,
    clientSecret: env.GOOGLE_CLIENT_SECRET,
    authorizationUrl: new URL('https://accounts.google.com/o/oauth2/v2/auth'),
    tokenUrl: new URL('https://www.googleapis.com/oauth2/v4/token'),
    userUrl: new URL('https://www.googleapis.com/oauth2/v3/userinfo'),
    scope: [
      'https://www.googleapis.com/auth/userinfo.email',
      'https://www.googleapis.com/auth/userinfo.profile',
      'openid',
    ],
    userSchema: googleUserSchema,
    userMapper: (providerUser) => ({
      id: providerUser.sub,
      email: providerUser.email,
      name: providerUser.name ?? 'User',
    }),
  }),
} satisfies Record<string, OAuthProviderConfig>;

const OAuthProviderEnum = z.enum(Object.keys(providerConfig) as [keyof typeof providerConfig]);

function createProvider<Schema extends z.ZodSchema>(providerConfig: OAuthProviderConfig<Schema>) {
  return providerConfig;
}

export default Object.freeze(providerConfig);
export { OAuthProviderEnum };
