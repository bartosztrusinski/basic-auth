import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
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
  dbInstance: DbInstance = db,
): Promise<void> {
  const expiresAt = createExpirationDate(serverConfig.twoFactorSetupExpirationInSeconds);

  await dbInstance
    .insert(twoFactorSetups)
    .values({ ...newTwoFactorSetup, expiresAt })
    .onConflictDoUpdate({
      target: [twoFactorSetups.userId],
      set: { secret: newTwoFactorSetup.secret, expiresAt },
    });
}

async function deleteTwoFactorSetup(
  userId: TwoFactorSetup['userId'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.delete(twoFactorSetups).where(eq(twoFactorSetups.userId, userId));
}

export { type TwoFactorSetup, getUserTwoFactorSetup, createTwoFactorSetup, deleteTwoFactorSetup };
