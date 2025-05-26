import 'server-only';
import { db, type TwoFactorAttempt } from '@/db';
import { generateRandomString, hashHighEntropy } from '@/auth/crypto';
import serverConfig from '@/auth/config/server';

export async function createTwoFactorAttempt(
  userId: TwoFactorAttempt['userId'],
): Promise<TwoFactorAttempt> {
  const token = generateRandomString(64);
  const hashedToken = hashHighEntropy(token);
  const expirationTime = Date.now() + serverConfig.twoFactorAttemptExpirationInSeconds * 1000;

  const twoFactorAttempt = await db.createTwoFactorAttempt({
    userId,
    token: hashedToken,
    expirationTime,
  });

  return {
    ...twoFactorAttempt,
    token,
  };
}
