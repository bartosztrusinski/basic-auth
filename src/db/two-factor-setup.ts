import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';

type TwoFactorSetup = {
  userId: User['id'];
  secret: string;
  expirationTime: number;
};

const [getTwoFactorSetups, writeTwoFactorSetups] =
  createTable<TwoFactorSetup>('two-factor-setups.json');

async function getUserTwoFactorSetup(userId: TwoFactorSetup['userId']) {
  const twoFactorSetups = await getTwoFactorSetups();
  return twoFactorSetups.find((token) => token.userId === userId);
}

async function createTwoFactorSetup(newTwoFactorSetup: TwoFactorSetup) {
  const twoFactorSetups = await getTwoFactorSetups();
  const existingUserSetup = twoFactorSetups.find(
    ({ userId }) => userId === newTwoFactorSetup.userId,
  );

  if (existingUserSetup) {
    throw new Error('Two-factor setup already exists for this user');
  }

  const existingSecret = twoFactorSetups.find(({ secret }) => secret === newTwoFactorSetup.secret);

  if (existingSecret) {
    throw new Error('Two-factor setup already exists with this secret');
  }

  await writeTwoFactorSetups((setups) => [...setups, newTwoFactorSetup]);

  return newTwoFactorSetup;
}

async function deleteTwoFactorSetup(userId: TwoFactorSetup['userId']) {
  await writeTwoFactorSetups((setups) => setups.filter((setup) => setup.userId !== userId));
}

export { getTwoFactorSetups, getUserTwoFactorSetup, createTwoFactorSetup, deleteTwoFactorSetup };
export type { TwoFactorSetup };
