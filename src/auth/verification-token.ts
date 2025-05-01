import 'server-only';
import { randomBytes } from 'crypto';
import { db, type VerificationToken } from '@/db';
import serverConfig from '@/auth/config/server';

export async function createEmailVerificationToken(email: VerificationToken['email']) {
  const token = randomBytes(64).toString('hex');
  const expirationTime = Date.now() + serverConfig.verificationTokenExpirationInSeconds * 1000;

  await db.deleteVerificationToken(email);

  const verificationToken = await db.createVerificationToken({
    email,
    token,
    expirationTime,
  });

  return verificationToken;
}
