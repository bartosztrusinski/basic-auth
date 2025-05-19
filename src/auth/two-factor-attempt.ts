import 'server-only';
import { randomBytes } from 'crypto';
import { db, type TwoFactorAttempt } from '@/db';
import serverConfig from '@/auth/config/server';

export async function createTwoFactorAttempt(userId: TwoFactorAttempt['userId']) {
  const token = randomBytes(32).toString('hex');
  const expirationTime = Date.now() + serverConfig.twoFactorAttemptExpirationInSeconds * 1000;

  const twoFactorAttempt = await db.createTwoFactorAttempt({
    userId,
    token,
    expirationTime,
  });

  return twoFactorAttempt;
}
