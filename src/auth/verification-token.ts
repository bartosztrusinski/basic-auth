import 'server-only';
import { db, type VerificationToken } from '@/db';
import { randomBytes } from 'crypto';

export async function createEmailVerificationToken(email: VerificationToken['email']) {
  const token = randomBytes(64).toString('hex');
  // TODO move to config
  const expirationTime = Date.now() + 60 * 60 * 1000; // 1 hour

  await db.deleteVerificationToken(email);

  const verificationToken = await db.createVerificationToken({
    email,
    token,
    expirationTime,
  });

  return verificationToken;
}
