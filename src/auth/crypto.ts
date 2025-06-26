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
import config from '@/auth/config';

const ENCODING: BinaryToTextEncoding = 'base64url';
const ENCRYPTION_ALGORITHM: CipherGCMTypes = 'aes-256-gcm';
const HASH_ALGORITHM = 'sha256';
const IV_LENGTH = 12;
const PEPPER = Buffer.from(env.PEPPER, ENCODING);
const ENCRYPTION_KEY = Buffer.from(env.ENCRYPTION_KEY, ENCODING);

function encrypt(data: Buffer) {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);
  const encryptedPart = cipher.update(data);
  const finalPart = cipher.final();

  const authTag = cipher.getAuthTag();

  return {
    encryptedData: Buffer.concat([encryptedPart, finalPart]),
    iv,
    authTag,
  };
}

function decrypt(encryptedData: Buffer, iv: Buffer, authTag: Buffer): Buffer {
  const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, ENCRYPTION_KEY, iv);

  decipher.setAuthTag(authTag);

  const decryptedPart = decipher.update(encryptedData);
  const finalPart = decipher.final();

  return Buffer.concat([decryptedPart, finalPart]);
}

function hashHighEntropy(value: string): Buffer {
  return createHmac(HASH_ALGORITHM, PEPPER).update(value.normalize()).digest();
}

function compareHashHighEntropy(value: string, hashedValue: Buffer): boolean {
  const inputHash = hashHighEntropy(value);
  return timingSafeEqual(inputHash, hashedValue);
}

async function hashLowEntropy(value: string): Promise<string> {
  return await argon2.hash(value.normalize(), { secret: PEPPER });
}

async function compareHashLowEntropy(value: string, hashedValue: string): Promise<boolean> {
  return await argon2.verify(hashedValue, value, { secret: PEPPER });
}

function generateToken(length = 64) {
  const token = generateRandomString(length);
  const hashedToken = hashHighEntropy(token);
  return { token, hashedToken };
}

function generateRandomString(byteLength: number) {
  return randomBytes(byteLength).toString(ENCODING);
}

function generateRandomCodes(count: number, length: number): string[] {
  const uniqueCodes = new Set<string>();

  while (uniqueCodes.size < count) {
    uniqueCodes.add(generateRandomCode(length));
  }

  return [...uniqueCodes];
}

function generateRandomCode(length: number): string {
  const bytes = randomBytes(length);
  const characters = config.codeAllowedCharacters;

  return Array.from(bytes)
    .map((byte) => characters[byte % characters.length])
    .join('');
}

export {
  encrypt,
  decrypt,
  hashLowEntropy,
  hashHighEntropy,
  compareHashLowEntropy,
  compareHashHighEntropy,
  generateToken,
  generateRandomString,
  generateRandomCodes,
};
