import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { twoFactorAttempts } from '@/db/schema';
import { type User } from '@/db/user';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type TwoFactorAttempt = InferSelectModel<typeof twoFactorAttempts>;

async function getTwoFactorAttemptByToken(
  token: TwoFactorAttempt['token'],
): Promise<(TwoFactorAttempt & { user: User }) | null> {
  const twoFactorAttempt = await db.query.twoFactorAttempts.findFirst({
    where: and(eq(twoFactorAttempts.token, token), gt(twoFactorAttempts.expiresAt, new Date())),
    with: { user: true },
  });

  return twoFactorAttempt ?? null;
}

async function createTwoFactorAttempt(
  newTwoFactorAttempt: Omit<TwoFactorAttempt, 'expiresAt'>,
): Promise<TwoFactorAttempt> {
  const [twoFactorAttempt] = await db
    .insert(twoFactorAttempts)
    .values({
      ...newTwoFactorAttempt,
      expiresAt: createExpirationDate(serverConfig.twoFactorAttemptExpirationInSeconds),
    })
    .returning();

  return twoFactorAttempt!;
}

async function deleteTwoFactorAttempt(token: TwoFactorAttempt['token']): Promise<void> {
  await db.delete(twoFactorAttempts).where(eq(twoFactorAttempts.token, token));
}

export {
  type TwoFactorAttempt,
  getTwoFactorAttemptByToken,
  createTwoFactorAttempt,
  deleteTwoFactorAttempt,
};
