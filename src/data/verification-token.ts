import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { verificationTokens } from '@/db/schema';
import { type User } from '@/data/user';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type VerificationToken = InferSelectModel<typeof verificationTokens>;

async function getVerificationTokenByToken(
  token: VerificationToken['token'],
): Promise<(VerificationToken & { user: User }) | null> {
  const verificationToken = await db.query.verificationTokens.findFirst({
    where: and(eq(verificationTokens.token, token), gt(verificationTokens.expiresAt, new Date())),
    with: { user: true },
  });

  return verificationToken ?? null;
}

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
  userId: VerificationToken['userId'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
}

export {
  type VerificationToken,
  getVerificationTokenByToken,
  createVerificationToken,
  deleteVerificationToken,
};
