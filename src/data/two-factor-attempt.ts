import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { twoFactorAttempts } from '@/db/schema';
import { type User } from '@/data/user';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type TwoFactorAttempt = InferSelectModel<typeof twoFactorAttempts>;

async function getTwoFactorAttemptByToken(
  token: TwoFactorAttempt['token'],
  dbInstance: DbInstance = db,
): Promise<
  | (Pick<TwoFactorAttempt, 'expiresAt'> & { user: Pick<User, 'id' | 'email' | 'twoFactorSecret'> })
  | null
> {
  const twoFactorAttempt = await dbInstance.query.twoFactorAttempts.findFirst({
    where: and(eq(twoFactorAttempts.token, token), gt(twoFactorAttempts.expiresAt, new Date())),
    with: { user: { columns: { id: true, email: true, twoFactorSecret: true } } },
    columns: { expiresAt: true },
  });

  return twoFactorAttempt ?? null;
}

async function createTwoFactorAttempt(
  newTwoFactorAttempt: Omit<TwoFactorAttempt, 'expiresAt'>,
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.insert(twoFactorAttempts).values({
    ...newTwoFactorAttempt,
    expiresAt: createExpirationDate(serverConfig.twoFactorAttemptExpirationInSeconds),
  });
}

async function deleteTwoFactorAttempt(
  token: TwoFactorAttempt['token'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.delete(twoFactorAttempts).where(eq(twoFactorAttempts.token, token));
}

export {
  type TwoFactorAttempt,
  getTwoFactorAttemptByToken,
  createTwoFactorAttempt,
  deleteTwoFactorAttempt,
};
