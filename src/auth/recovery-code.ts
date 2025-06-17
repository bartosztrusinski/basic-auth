import 'server-only';
import { createRecoveryCodes, type RecoveryCode } from '@/db/recovery-code';
import { generateRandomCodes, hashLowEntropy } from '@/auth/crypto';
import config from '@/auth/config';

const RECOVERY_CODES_COUNT = 10;

export async function generateRecoveryCodes(
  userId: RecoveryCode['userId'],
): Promise<RecoveryCode['code'][]> {
  const generatedCodes = generateRandomCodes(RECOVERY_CODES_COUNT, config.recoveryCodeLength);

  try {
    const hashedCodes = await Promise.all(generatedCodes.map((code) => hashLowEntropy(code)));
    await createRecoveryCodes(hashedCodes.map((code) => ({ code, userId })));

    return generatedCodes;
  } catch {
    throw new Error('Failed to generate recovery codes');
  }
}
