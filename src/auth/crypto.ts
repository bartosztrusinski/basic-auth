import 'server-only';
import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
  scrypt,
  timingSafeEqual,
  type ScryptOptions,
  type BinaryLike,
  type CipherGCMTypes,
  type BinaryToTextEncoding,
} from 'node:crypto';
import { promisify } from 'node:util';
import { env } from '@/env';

const scryptPromise = promisify<BinaryLike, BinaryLike, number, ScryptOptions, Buffer>(scrypt);

const ENCODING: BinaryToTextEncoding = 'base64url';
const ENCRYPTION_ALGORITHM: CipherGCMTypes = 'aes-256-gcm';
const HASH_ALGORITHM = 'sha256';
const IV_LENGTH = 12;
const SALT_LENGTH = 16;
const DELIMITER = ':';

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

/**
 * Hash a low-entropy value using scrypt with a salt and pepper
 * @param value - The value to hash
 * @param salt - The salt to use. Defaults to random 16 bytes
 * @returns The salt and hash string separated by a delimiter
 */
async function hashLowEntropy(value: string, salt = generateSalt()): Promise<string> {
  const hmac = createHmac(HASH_ALGORITHM, Buffer.from(env.PEPPER, ENCODING))
    .update(value.normalize())
    .digest(ENCODING);
  const hash = await scryptPromise(hmac, Buffer.from(salt, ENCODING), 32, { N: 16384, r: 8, p: 1 });

  return `${salt}${DELIMITER}${hash.toString(ENCODING)}`;
}

/**
 * Hash a high-entropy value using HMAC with a pepper
 * @param value - The value to hash
 * @returns The hash string
 */
function hashHighEntropy(value: string): string {
  return createHmac(HASH_ALGORITHM, Buffer.from(env.PEPPER, ENCODING))
    .update(value.normalize())
    .digest(ENCODING);
}

async function compareHashLowEntropy(value: string, hashedValue: string): Promise<boolean> {
  const [salt, hash] = hashedValue.split(DELIMITER);
  const hashedInput = await hashLowEntropy(value, salt);
  const [, inputHash] = hashedInput.split(DELIMITER);

  if (!hash || !inputHash || !salt) {
    throw new Error('Invalid hash format');
  }

  return timingSafeEqual(Buffer.from(hash, ENCODING), Buffer.from(inputHash, ENCODING));
}

function compareHashHighEntropy(value: string, hashedValue: string): boolean {
  const inputHash = hashHighEntropy(value);
  return timingSafeEqual(Buffer.from(inputHash, ENCODING), Buffer.from(hashedValue, ENCODING));
}

function generateRandomString(byteLength: number) {
  return randomBytes(byteLength).toString(ENCODING);
}

function generateSalt() {
  return generateRandomString(SALT_LENGTH);
}

export {
  encrypt,
  decrypt,
  hashLowEntropy,
  hashHighEntropy,
  compareHashLowEntropy,
  compareHashHighEntropy,
  generateRandomString,
  generateSalt,
};
