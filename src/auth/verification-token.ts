import 'server-only';
import { db, type VerificationToken } from '@/db';
import { generateRandomString, hashHighEntropy } from '@/auth/crypto';
import serverConfig from '@/auth/config/server';

export async function createEmailVerificationToken(
  email: VerificationToken['email'],
): Promise<VerificationToken> {
  const token = generateRandomString(64);
  const hashedToken = hashHighEntropy(token);
  const expirationTime = Date.now() + serverConfig.verificationTokenExpirationInSeconds * 1000;

  await db.deleteVerificationToken(email);

  const verificationToken = await db.createVerificationToken({
    email,
    token: hashedToken,
    expirationTime,
  });

  return {
    ...verificationToken,
    token,
  };
}
