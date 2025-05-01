import { type Account } from '@/db';
import { currentUser } from '../session';
import { getProviderName } from '../oauth';
import { OAuthProviderEnum } from '../oauth/providers';
import { type OAuthProvider } from '../oauth/types';
import { AccountItem } from '../components/account-item';

type Props = {
  accounts: Account[];
};

export async function AccountsManager({ accounts }: Props) {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  const isLinked = (provider: OAuthProvider) =>
    accounts.some((account) => account.provider === provider);
  const isUnlinkingEnabled = accounts.length > 1 || user.hasPassword;

  return OAuthProviderEnum.options.map((provider) => (
    <AccountItem
      key={provider}
      provider={provider}
      name={getProviderName(provider)}
      isLinked={isLinked(provider)}
      isUnlinkingEnabled={isUnlinkingEnabled}
    />
  ));
}
