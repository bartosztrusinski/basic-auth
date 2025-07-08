import { getProviderName } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { type OAuthProvider, type StateData } from '@/auth/oauth';
import { currentUser } from '@/auth/session';
import { OAuthAccountManager } from './oauth-account-manager';

type Props = {
  linkedProviders: OAuthProvider[];
} & StateData;

export async function OAuthAccountsManager({ linkedProviders, ...stateData }: Props) {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const isProviderLinked = (provider: OAuthProvider) => linkedProviders.includes(provider);
  const isUnlinkingEnabled = linkedProviders.length > 1 || user.hasPassword;

  return OAuthProviderEnum.options.map((provider) => (
    <OAuthAccountManager
      key={provider}
      provider={provider}
      name={getProviderName(provider)}
      isLinked={isProviderLinked(provider)}
      isUnlinkingEnabled={isUnlinkingEnabled}
      {...stateData}
    />
  ));
}
