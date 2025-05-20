import 'server-only';
import { db, type VerificationToken } from '@/db';
import { generateRandomValue } from '@/auth/crypto';
import serverConfig from '@/auth/config/server';

export async function createEmailVerificationToken(email: VerificationToken['email']) {
  const token = generateRandomValue(64);
  const expirationTime = Date.now() + serverConfig.verificationTokenExpirationInSeconds * 1000;

  await db.deleteVerificationToken(email);

  const verificationToken = await db.createVerificationToken({
    email,
    token,
    expirationTime,
  });

  return verificationToken;
}
