import * as user from '@/db/user';
import * as session from '@/db/session';
import * as account from '@/db/account';
import * as verificationToken from '@/db/verification-token';
import * as twoFactorSetup from '@/db/two-factor-setup';
import * as twoFactorAttempt from '@/db/two-factor-attempt';
import * as recoveryCode from '@/db/recovery-code';

export const db = {
  ...user,
  ...session,
  ...account,
  ...verificationToken,
  ...twoFactorSetup,
  ...twoFactorAttempt,
  ...recoveryCode,
};
export { UserRoles, type User } from '@/db/user';
export type { Session } from '@/db/session';
export type { Account } from '@/db/account';
export type { VerificationToken } from '@/db/verification-token';
export type { TwoFactorSetup } from '@/db/two-factor-setup';
export type { TwoFactorAttempt } from '@/db/two-factor-attempt';
export type { RecoveryCode } from '@/db/recovery-code';
