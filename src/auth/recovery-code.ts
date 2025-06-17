import 'server-only';
import { createRecoveryCode, type RecoveryCode } from '@/db/recovery-code';
import { generateRandomCodes, hashLowEntropy } from '@/auth/crypto';
import config from '@/auth/config';

const RECOVERY_CODES_COUNT = 10;

export async function createRecoveryCodes(
  userId: RecoveryCode['userId'],
): Promise<RecoveryCode['code'][]> {
  const generatedCodes = generateRandomCodes(RECOVERY_CODES_COUNT, config.recoveryCodeLength);

  try {
    const hashedCodes = await Promise.all(generatedCodes.map((code) => hashLowEntropy(code)));

    // TODO insert all values in one query
    for (const code of hashedCodes) {
      await createRecoveryCode({ code, userId });
    }

    return generatedCodes;
  } catch {
    throw new Error('Failed to create recovery codes');
  }
}
