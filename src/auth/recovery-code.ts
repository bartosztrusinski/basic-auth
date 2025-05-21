import { randomBytes } from 'node:crypto';
import { db, type RecoveryCode } from '@/db';
import { hash } from '@/auth/crypto';

const RECOVERY_CODES_COUNT = 10;
const RECOVERY_CODE_LENGTH = 12;
const RECOVERY_CODE_CHARACTERS = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789';

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
  const bytes = randomBytes(RECOVERY_CODE_LENGTH);

  return Array.from(bytes)
    .map((byte) => RECOVERY_CODE_CHARACTERS[byte % RECOVERY_CODE_CHARACTERS.length])
    .join('');
}
