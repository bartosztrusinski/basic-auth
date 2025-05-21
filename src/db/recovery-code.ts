import { type User } from '@/db/user';
import { createTable } from '@/db/util';

type RecoveryCode = {
  userId: User['id'];
  code: string;
  usedAt?: number;
};

const [getRecoveryCodes, writeRecoveryCodes] = createTable<RecoveryCode>('recovery-codes.json');

async function getActiveRecoveryCode(userId: User['id']) {
  const codes = await getRecoveryCodes();
  const activeCodes = codes.filter((code) => code.userId === userId && !code.usedAt);
  return activeCodes[0] ?? null;
}

async function createRecoveryCode(newCode: Omit<RecoveryCode, 'usedAt'>) {
  const codes = await getRecoveryCodes();
  const isExistingCode = codes.some(
    ({ code, userId }) => userId === newCode.userId && code === newCode.code,
  );

  if (isExistingCode) {
    throw new Error('Recovery code already exists');
  }

  await writeRecoveryCodes((codes) => [...codes, newCode]);

  return newCode;
}

async function useRecoveryCode(activeCode: RecoveryCode) {
  await writeRecoveryCodes((codes) =>
    codes.map((code) => {
      if (code.code === activeCode.code && code.userId === activeCode.userId) {
        if (code.usedAt) {
          throw new Error('Recovery code already used');
        }

        return { ...code, usedAt: Date.now() };
      }

      return code;
    }),
  );
}

async function deleteUserRecoveryCodes(userId: User['id']) {
  await writeRecoveryCodes((codes) => codes.filter((code) => code.userId !== userId));
}

export {
  getRecoveryCodes,
  getActiveRecoveryCode,
  createRecoveryCode,
  useRecoveryCode,
  deleteUserRecoveryCodes,
};
export type { RecoveryCode };
