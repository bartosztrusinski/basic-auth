import * as user from '@/db/user';
import * as session from '@/db/session';
import * as account from '@/db/account';
import * as verificationToken from '@/db/verification-token';

const db = {
  ...user,
  ...session,
  ...account,
  ...verificationToken,
};

export { db };
export { UserRoles, type User } from '@/db/user';
export type { Session } from '@/db/session';
export type { Account } from '@/db/account';
export type { VerificationToken } from '@/db/verification-token';
