import 'server-only';
import { scrypt, randomBytes, timingSafeEqual, type BinaryLike } from 'node:crypto';
import { promisify } from 'node:util';

const scryptPromise = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

export async function hashPassword(password: string, salt: string) {
  const hash = await scryptPromise(password.normalize(), salt, 64);
  return hash.toString('hex');
}

export function generateSalt() {
  return randomBytes(16).toString('hex');
}

export async function comparePasswords(password: string, hashedPassword: string, salt: string) {
  const inputHashedPassword = await hashPassword(password, salt);
  return timingSafeEqual(
    Buffer.from(inputHashedPassword, 'hex'),
    Buffer.from(hashedPassword, 'hex'),
  );
}
