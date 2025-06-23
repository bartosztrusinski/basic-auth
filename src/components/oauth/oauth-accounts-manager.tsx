import { type Account } from '@/data/account';
import { getProviderName } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { type OAuthProvider, type StateData } from '@/auth/oauth';
import { currentUser } from '@/auth/session';
import { OAuthAccountManager } from './oauth-account-manager';

type Props = {
  accounts: Account[];
} & StateData;

export async function OAuthAccountsManager({ accounts, ...stateData }: Props) {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const isLinked = (provider: OAuthProvider) =>
    accounts.some((account) => account.provider === provider);
  const isUnlinkingEnabled = accounts.length > 1 || user.hasPassword;

  return OAuthProviderEnum.options.map((provider) => (
    <OAuthAccountManager
      key={provider}
      provider={provider}
      name={getProviderName(provider)}
      isLinked={isLinked(provider)}
      isUnlinkingEnabled={isUnlinkingEnabled}
      {...stateData}
    />
  ));
}
