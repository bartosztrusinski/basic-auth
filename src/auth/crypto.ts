import { type CipherKey, createCipheriv, createDecipheriv, randomBytes } from 'node:crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const SEPARATOR = ':';

export function encrypt(secret: string, key: CipherKey): string {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);
  let encryptedSecret = cipher.update(secret, 'utf8', 'base64');
  encryptedSecret += cipher.final('base64');
  const authTag = cipher.getAuthTag();

  return [iv.toString('base64'), authTag.toString('base64'), encryptedSecret].join(SEPARATOR);
}

export function decrypt(data: string, key: CipherKey): string {
  const [iv, authTag, encryptedSecret] = data.split(SEPARATOR);

  if (!iv || !authTag || !encryptedSecret) {
    throw new Error('Invalid data format');
  }

  const decipher = createDecipheriv(ALGORITHM, key, Buffer.from(iv, 'base64'));
  decipher.setAuthTag(Buffer.from(authTag, 'base64'));
  const decryptedSecret =
    decipher.update(encryptedSecret, 'base64', 'utf8') + decipher.final('utf8');
  return decryptedSecret;
}
