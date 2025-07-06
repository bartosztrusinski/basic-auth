import 'server-only';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { accounts } from '@/db/schema';

type Account = InferSelectModel<typeof accounts>;

async function getUserAccounts(userId: Account['userId']): Promise<Account[]> {
  return await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });
}

/**
 * Creates a new account for the user
 * @returns Boolean indicating whether the account was created successfully
 */
async function createAccount(newAccount: Account, dbInstance: DbInstance = db): Promise<boolean> {
  const { rowCount } = await dbInstance.insert(accounts).values(newAccount).onConflictDoNothing();

  return (rowCount ?? 0) > 0;
}

async function deleteAccount(
  userId: Account['userId'],
  provider: Account['provider'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, provider)));
}

export { type Account, getUserAccounts, createAccount, deleteAccount };
