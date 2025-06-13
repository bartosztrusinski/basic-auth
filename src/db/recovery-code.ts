import 'server-only';
import { and, eq, isNull, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { recoveryCodes } from '@/db/schema';

type RecoveryCode = InferSelectModel<typeof recoveryCodes>;

async function getActiveRecoveryCodes(userId: RecoveryCode['userId']): Promise<RecoveryCode[]> {
  return await db.query.recoveryCodes.findMany({
    where: and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)),
  });
}

async function createRecoveryCode(
  newCode: Omit<RecoveryCode, 'usedAt'>,
): Promise<RecoveryCode | null> {
  const [code] = await db.insert(recoveryCodes).values(newCode).returning();
  return code ?? null;
}

async function consumeRecoveryCode(activeRecoveryCode: RecoveryCode): Promise<RecoveryCode | null> {
  const [updatedCode] = await db
    .update(recoveryCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(recoveryCodes.code, activeRecoveryCode.code),
        eq(recoveryCodes.userId, activeRecoveryCode.userId),
        isNull(recoveryCodes.usedAt),
      ),
    )
    .returning();

  return updatedCode ?? null;
}

async function deleteUserRecoveryCodes(userId: RecoveryCode['userId']): Promise<void> {
  await db.delete(recoveryCodes).where(eq(recoveryCodes.userId, userId));
}

export {
  type RecoveryCode,
  getActiveRecoveryCodes,
  createRecoveryCode,
  consumeRecoveryCode,
  deleteUserRecoveryCodes,
};
