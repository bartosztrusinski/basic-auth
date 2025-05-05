import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';
import { type OAuthProvider } from '@/auth/oauth';

type Account = {
  userId: User['id'];
  provider: OAuthProvider;
  providerAccountId: string;
};

const [getAccounts, writeAccounts] = createTable<Account>('accounts.json');

async function getUserAccounts(userId: User['id']) {
  const accounts = await getAccounts();
  return accounts.filter((account) => account.userId === userId);
}

async function getAccountByProvider(
  provider: Account['provider'],
  providerAccountId: Account['providerAccountId'],
) {
  const accounts = await getAccounts();
  return accounts.find(
    (account) => account.provider === provider && account.providerAccountId === providerAccountId,
  );
}

async function createAccount(newAccount: Account) {
  const accounts = await getAccounts();
  const isExistingAccount = accounts.some(
    ({ provider, providerAccountId }) =>
      provider === newAccount.provider && providerAccountId === newAccount.providerAccountId,
  );

  if (isExistingAccount) {
    return null;
  }

  await writeAccounts((accounts) => [...accounts, newAccount]);

  return newAccount;
}

async function deleteAccount(userId: User['id'], provider: Account['provider']) {
  await writeAccounts((accounts) =>
    accounts.filter((account) => !(account.userId === userId && account.provider === provider)),
  );
}

async function deleteUserAccounts(userId: User['id']) {
  await writeAccounts((accounts) => accounts.filter((account) => account.userId !== userId));
}

export {
  getAccounts,
  getUserAccounts,
  getAccountByProvider,
  createAccount,
  deleteAccount,
  deleteUserAccounts,
};
export type { Account };
