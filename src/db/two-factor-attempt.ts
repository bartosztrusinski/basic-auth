import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';

type TwoFactorAttempt = {
  token: string;
  userId: User['id'];
  expirationTime: number;
};

const [getTwoFactorAttempts, writeTwoFactorAttempts] = createTable<TwoFactorAttempt>(
  'two-factor-attempts.json',
);

async function getTwoFactorAttemptByToken(token: TwoFactorAttempt['token']) {
  const twoFactorAttempts = await getTwoFactorAttempts();
  return twoFactorAttempts.find((attempt) => attempt.token === token);
}

async function createTwoFactorAttempt(newTwoFactorAttempt: TwoFactorAttempt) {
  const twoFactorAttempts = await getTwoFactorAttempts();
  const isExistingToken = twoFactorAttempts.some(
    ({ token }) => token === newTwoFactorAttempt.token,
  );

  if (isExistingToken) {
    throw new Error('Two-factor attempt already exists with this token');
  }

  await writeTwoFactorAttempts((attempts) => [...attempts, newTwoFactorAttempt]);

  return newTwoFactorAttempt;
}

async function deleteTwoFactorAttempt(token: TwoFactorAttempt['token']) {
  await writeTwoFactorAttempts((attempts) => attempts.filter((attempt) => attempt.token !== token));
}

export {
  getTwoFactorAttempts,
  getTwoFactorAttemptByToken,
  createTwoFactorAttempt,
  deleteTwoFactorAttempt,
};
export type { TwoFactorAttempt };
