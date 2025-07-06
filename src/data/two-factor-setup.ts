import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { twoFactorSetups } from '@/db/schema';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type TwoFactorSetup = InferSelectModel<typeof twoFactorSetups>;

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
): Promise<TwoFactorSetup | null> {
  const [setup] = await dbInstance
    .delete(twoFactorSetups)
    .where(and(eq(twoFactorSetups.userId, userId), gt(twoFactorSetups.expiresAt, new Date())))
    .returning();

  return setup ?? null;
}

export { type TwoFactorSetup, createTwoFactorSetup, deleteTwoFactorSetup };
