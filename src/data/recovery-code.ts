import 'server-only';
import { and, eq, isNull, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { recoveryCodes } from '@/db/schema';

type RecoveryCode = InferSelectModel<typeof recoveryCodes>;

async function getActiveRecoveryCodes(userId: RecoveryCode['userId']): Promise<RecoveryCode[]> {
  return await db.query.recoveryCodes.findMany({
    where: and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)),
  });
}

async function createRecoveryCodes(
  newCodes: Omit<RecoveryCode, 'usedAt'>[],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.insert(recoveryCodes).values(newCodes);
}

async function consumeRecoveryCode(
  activeRecoveryCode: RecoveryCode,
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance
    .update(recoveryCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(recoveryCodes.code, activeRecoveryCode.code),
        eq(recoveryCodes.userId, activeRecoveryCode.userId),
        isNull(recoveryCodes.usedAt),
      ),
    );
}

async function deleteUserRecoveryCodes(
  userId: RecoveryCode['userId'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
}

export {
  type RecoveryCode,
  getActiveRecoveryCodes,
  createRecoveryCodes,
  consumeRecoveryCode,
  deleteUserRecoveryCodes,
};
