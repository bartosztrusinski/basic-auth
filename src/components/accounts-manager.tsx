import { type Account } from '@/db';
import { getProviderName } from '@/auth/oauth';
import { OAuthProviderEnum } from '@/auth/config/providers';
import { type OAuthProvider } from '@/auth/oauth';
import { currentUser } from '@/auth/session';
import { AccountItem } from '@/components/account-item';

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
