import 'server-only';
import { db, type TwoFactorAttempt } from '@/db';
import { generateRandomValue } from '@/auth/crypto';
import serverConfig from '@/auth/config/server';

export async function createTwoFactorAttempt(userId: TwoFactorAttempt['userId']) {
  const token = generateRandomValue(32);
  const expirationTime = Date.now() + serverConfig.twoFactorAttemptExpirationInSeconds * 1000;

  const twoFactorAttempt = await db.createTwoFactorAttempt({
    userId,
    token,
    expirationTime,
  });

  return twoFactorAttempt;
}
