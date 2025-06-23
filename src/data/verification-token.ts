import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
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
): Promise<VerificationToken> {
  const expiresAt = createExpirationDate(serverConfig.verificationTokenExpirationInSeconds);
  const [token] = await db
    .insert(verificationTokens)
    .values({ ...newToken, expiresAt })
    .onConflictDoUpdate({
      target: [verificationTokens.userId],
      set: { token: newToken.token, expiresAt },
    })
    .returning();

  return token!;
}

async function deleteVerificationToken(userId: VerificationToken['userId']): Promise<void> {
  await db.delete(verificationTokens).where(eq(verificationTokens.userId, userId));
}

export {
  type VerificationToken,
  getVerificationTokenByToken,
  createVerificationToken,
  deleteVerificationToken,
};
