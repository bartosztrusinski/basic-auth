import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { twoFactorSetups } from '@/db/schema';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type TwoFactorSetup = InferSelectModel<typeof twoFactorSetups>;

async function getUserTwoFactorSetup(
  userId: TwoFactorSetup['userId'],
): Promise<TwoFactorSetup | null> {
  const twoFactorSetup = await db.query.twoFactorSetups.findFirst({
    where: and(eq(twoFactorSetups.userId, userId), gt(twoFactorSetups.expiresAt, new Date())),
  });

  return twoFactorSetup ?? null;
}

async function createTwoFactorSetup(
  newTwoFactorSetup: Omit<TwoFactorSetup, 'expiresAt'>,
): Promise<TwoFactorSetup | null> {
  const expiresAt = createExpirationDate(serverConfig.twoFactorSetupExpirationInSeconds);
  const [twoFactorSetup] = await db
    .insert(twoFactorSetups)
    .values({ ...newTwoFactorSetup, expiresAt })
    .onConflictDoUpdate({
      target: [twoFactorSetups.userId],
      set: { secret: newTwoFactorSetup.secret, expiresAt },
    })
    .returning();

  return twoFactorSetup ?? null;
}

async function deleteTwoFactorSetup(userId: TwoFactorSetup['userId']): Promise<void> {
  await db.delete(twoFactorSetups).where(eq(twoFactorSetups.userId, userId));
}

export { type TwoFactorSetup, getUserTwoFactorSetup, createTwoFactorSetup, deleteTwoFactorSetup };
