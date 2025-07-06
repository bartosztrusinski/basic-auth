import 'server-only';
import { eq, gt, and, type InferInsertModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { verificationTokens } from '@/db/schema';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type VerificationToken = InferInsertModel<typeof verificationTokens>;

async function createVerificationToken(
  newToken: Omit<VerificationToken, 'expiresAt'>,
  dbInstance: DbInstance = db,
): Promise<void> {
  const expiresAt = createExpirationDate(serverConfig.verificationTokenExpirationInSeconds);
  await dbInstance
    .insert(verificationTokens)
    .values({ ...newToken, expiresAt })
    .onConflictDoUpdate({
      target: [verificationTokens.userId],
      set: { token: newToken.token, expiresAt },
    });
}

async function deleteVerificationToken(
  token: VerificationToken['token'],
  dbInstance: DbInstance = db,
): Promise<VerificationToken | null> {
  const [verificationToken] = await dbInstance
    .delete(verificationTokens)
    .where(and(eq(verificationTokens.token, token), gt(verificationTokens.expiresAt, new Date())))
    .returning();

  return verificationToken ?? null;
}

export { type VerificationToken, createVerificationToken, deleteVerificationToken };
