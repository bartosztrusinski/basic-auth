import 'server-only';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  timingSafeEqual,
  type CipherGCMTypes,
  type BinaryToTextEncoding,
} from 'node:crypto';
import argon2 from 'argon2';
import { env } from '@/env';

const ENCODING: BinaryToTextEncoding = 'base64url';
const ENCRYPTION_ALGORITHM: CipherGCMTypes = 'aes-256-gcm';
const HASH_ALGORITHM = 'sha256';
const IV_LENGTH = 12;
const DELIMITER = ':';
const PEPPER = Buffer.from(env.PEPPER, ENCODING);

function encrypt(data: string): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(env.ENCRYPTION_KEY, ENCODING),
    iv,
  );

  let encryptedSecret = cipher.update(data, 'utf8', ENCODING);
  encryptedSecret += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  return [iv.toString(ENCODING), authTag.toString(ENCODING), encryptedSecret].join(DELIMITER);
}

function decrypt(data: string): string {
  const [iv, authTag, encryptedSecret] = data.split(DELIMITER);

  if (!iv || !authTag || !encryptedSecret) {
    throw new Error('Invalid data format');
  }

  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    Buffer.from(env.ENCRYPTION_KEY, ENCODING),
    Buffer.from(iv, ENCODING),
  );
  decipher.setAuthTag(Buffer.from(authTag, ENCODING));

  let decryptedSecret = decipher.update(encryptedSecret, ENCODING, 'utf8');
  decryptedSecret += decipher.final('utf8');

  return decryptedSecret;
}

function hashLowEntropy(value: string): Promise<string> {
  return argon2.hash(value.normalize(), { secret: PEPPER });
}

function hashHighEntropy(value: string): string {
  return createHmac(HASH_ALGORITHM, PEPPER).update(value.normalize()).digest(ENCODING);
}

function compareHashLowEntropy(value: string, hashedValue: string): Promise<boolean> {
  return argon2.verify(hashedValue, value, { secret: PEPPER });
}

function compareHashHighEntropy(value: string, hashedValue: string): boolean {
  const inputHash = hashHighEntropy(value);
  return timingSafeEqual(Buffer.from(inputHash, ENCODING), Buffer.from(hashedValue, ENCODING));
}

function generateRandomString(byteLength: number) {
  return randomBytes(byteLength).toString(ENCODING);
}

export {
  encrypt,
  decrypt,
  hashLowEntropy,
  hashHighEntropy,
  compareHashLowEntropy,
  compareHashHighEntropy,
  generateRandomString,
};
