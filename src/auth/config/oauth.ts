import { type OAuthProvider } from '@/auth/oauth';
import { env } from '@/env';

type OAuthProviderConfig = {
  clientId: string;
  clientSecret: string;
  authorizationUrl: URL;
  tokenUrl: URL;
  userUrl: URL;
  scope: string[];
};

const providerConfig: Record<OAuthProvider, OAuthProviderConfig> = {
  discord: {
    clientId: env.DISCORD_CLIENT_ID,
    clientSecret: env.DISCORD_CLIENT_SECRET,
    authorizationUrl: new URL('https://discord.com/oauth2/authorize'),
    tokenUrl: new URL('https://discord.com/api/oauth2/token'),
    userUrl: new URL('https://discord.com/api/users/@me'),
    scope: ['identify', 'email'],
  },
};

export default Object.freeze(providerConfig);
