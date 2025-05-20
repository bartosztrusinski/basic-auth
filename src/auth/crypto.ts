import 'server-only';
import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
  scrypt,
  timingSafeEqual,
  type BinaryLike,
  type CipherGCMTypes,
  type CipherKey,
} from 'node:crypto';
import { promisify } from 'node:util';

const scryptPromise = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

const ENCODING: BufferEncoding = 'base64url';
const ALGORITHM: CipherGCMTypes = 'aes-256-gcm';
const IV_LENGTH = 12;
const DELIMITER = ':';

function encrypt(secret: string, key: CipherKey): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encryptedSecret = cipher.update(secret, 'utf8', ENCODING);
  encryptedSecret += cipher.final(ENCODING);

  const authTag = cipher.getAuthTag();

  return [iv.toString(ENCODING), authTag.toString(ENCODING), encryptedSecret].join(DELIMITER);
}

function decrypt(data: string, key: CipherKey): string {
  const [iv, authTag, encryptedSecret] = data.split(DELIMITER);

  if (!iv || !authTag || !encryptedSecret) {
    throw new Error('Invalid data format');
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, ENCODING));
  decipher.setAuthTag(Buffer.from(authTag, ENCODING));

  let decryptedSecret = decipher.update(encryptedSecret, ENCODING, 'utf8');
  decryptedSecret += decipher.final('utf8');

  return decryptedSecret;
}

/**
 * Hash a value using scrypt with a salt
 * @param value - The value to hash
 * @param salt - The salt to use (default: random 16 bytes)
 * @return The hashed value as salt and hash separated by a delimiter
 */
async function hash(value: string, salt = generateSalt()) {
  const hash = await scryptPromise(value.normalize(), salt, 64);
  return `${salt}${DELIMITER}${hash.toString(ENCODING)}`;
}

async function compareHash(value: string, hashedValue: string) {
  const [salt, originalHash] = hashedValue.split(DELIMITER);
  const hashedInput = await hash(value, salt);
  const [, inputHash] = hashedInput.split(DELIMITER);

  if (!originalHash || !inputHash || !salt) {
    throw new Error('Invalid hash format');
  }

  return timingSafeEqual(Buffer.from(originalHash, ENCODING), Buffer.from(inputHash, ENCODING));
}

/** Generate random URL safe value */
function generateRandomValue(byteLength: number) {
  return randomBytes(byteLength).toString(ENCODING);
}

function generateSalt() {
  return generateRandomValue(16);
}

export { encrypt, decrypt, hash, generateRandomValue, generateSalt, compareHash };
