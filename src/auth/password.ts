import 'server-only';
import { scrypt, randomBytes, type BinaryLike } from 'node:crypto';
import { promisify } from 'node:util';

const scryptPromise = promisify<BinaryLike, BinaryLike, number, Buffer>(scrypt);

export async function hashPassword(password: string, salt: string) {
  const hash = await scryptPromise(password.normalize(), salt, 64);
  return hash.toString('hex');
}

export function generateSalt() {
  return randomBytes(16).toString('hex');
}
