import 'server-only';
import { and, eq, isNull, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { recoveryCodes } from '@/db/schema';

type RecoveryCode = InferSelectModel<typeof recoveryCodes>;

async function getActiveRecoveryCodes(
  userId: RecoveryCode['userId'],
): Promise<RecoveryCode['code'][]> {
  const codes = await db.query.recoveryCodes.findMany({
    where: and(eq(recoveryCodes.userId, userId), isNull(recoveryCodes.usedAt)),
    columns: { code: true },
  });

  return codes.map(({ code }) => code);
}

async function createRecoveryCodes(
  newCodes: Omit<RecoveryCode, 'usedAt'>[],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.insert(recoveryCodes).values(newCodes);
}

async function consumeRecoveryCode(
  { code, userId }: Omit<RecoveryCode, 'usedAt'>,
  dbInstance: DbInstance = db,
): Promise<boolean> {
  const { rowCount } = await dbInstance
    .update(recoveryCodes)
    .set({ usedAt: new Date() })
    .where(
      and(
        eq(recoveryCodes.code, code),
        eq(recoveryCodes.userId, userId),
        isNull(recoveryCodes.usedAt),
      ),
    );

  return (rowCount ?? 0) > 0;
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
