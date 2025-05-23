import 'server-only';
import { randomBytes } from 'node:crypto';
import { db, type RecoveryCode } from '@/db';
import { hash } from '@/auth/crypto';
import config from '@/auth/config';

const RECOVERY_CODES_COUNT = 10;

export async function createRecoveryCodes(
  userId: RecoveryCode['userId'],
): Promise<RecoveryCode['code'][]> {
  const uniqueCodes = new Set<RecoveryCode['code']>();

  while (uniqueCodes.size < RECOVERY_CODES_COUNT) {
    uniqueCodes.add(generateRecoveryCode());
  }

  const generatedCodes = [...uniqueCodes];

  try {
    const hashedCodes = await Promise.all(generatedCodes.map((code) => hash(code)));

    for (const code of hashedCodes) {
      await db.createRecoveryCode({ code, userId });
    }

    return generatedCodes;
  } catch {
    throw new Error('Failed to create recovery codes');
  }
}

function generateRecoveryCode(): string {
  const bytes = randomBytes(config.recoveryCodeLength);
  const characters = config.recoveryCodeAllowedCharacters;

  return Array.from(bytes)
    .map((byte) => characters[byte % characters.length])
    .join('');
}
