import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';

type TwoFactorSetup = {
  userId: User['id'];
  secret: string;
  expirationTime: number;
};

const [getTwoFactorSetups, writeTwoFactorSetups] =
  createTable<TwoFactorSetup>('two-factory-setups.json');

async function getUserTwoFactorSetup(userId: TwoFactorSetup['userId']) {
  const twoFactorySetups = await getTwoFactorSetups();
  const twoFactorySetup = twoFactorySetups.find((token) => token.userId === userId);

  if (!twoFactorySetup) {
    return null;
  }

  return twoFactorySetup;
}

async function createTwoFactorSetup(newTwoFactorSetup: TwoFactorSetup) {
  const twoFactorSetups = await getTwoFactorSetups();
  const existingTwoFactorSetup = twoFactorSetups.find(
    ({ userId }) => userId === newTwoFactorSetup.userId,
  );

  if (existingTwoFactorSetup) {
    throw new Error('Two-factor setup already exists for this user');
  }

  await writeTwoFactorSetups((setups) => [...setups, newTwoFactorSetup]);

  return newTwoFactorSetup;
}

async function deleteTwoFactorSetup(userId: TwoFactorSetup['userId']) {
  await writeTwoFactorSetups((setups) => setups.filter((setup) => setup.userId !== userId));
}

export { getTwoFactorSetups, getUserTwoFactorSetup, createTwoFactorSetup, deleteTwoFactorSetup };
export type { TwoFactorSetup };
