import { type z } from 'zod';
import { type User } from '@/db';
import { type OAuthProviderEnum } from './providers';

export type OAuthProvider = z.infer<typeof OAuthProviderEnum>;

export type OAuthUser = {
  id: string;
} & Pick<User, 'email' | 'name'>;

export type OAuthProviderConfig<Schema extends z.ZodSchema = z.ZodSchema> = {
  clientId: string;
  clientSecret: string;
  authorizationUrl: URL;
  tokenUrl: URL;
  userUrl: URL;
  scope: string[];
} & OAuthProviderUser<Schema>;

export type OAuthProviderUser<Schema extends z.ZodSchema> = {
  userSchema: Schema;
  userMapper: (providerUser: z.infer<Schema>) => OAuthUser;
};
