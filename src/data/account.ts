import 'server-only';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { accounts } from '@/db/schema';

type Account = InferSelectModel<typeof accounts>;

async function getUserAccounts(userId: Account['userId']): Promise<Account[]> {
  return await db.query.accounts.findMany({
    where: eq(accounts.userId, userId),
  });
}

async function createAccount(newAccount: Account): Promise<Account | null> {
  const [account] = await db.insert(accounts).values(newAccount).onConflictDoNothing().returning();
  return account ?? null;
}

async function deleteAccount(
  userId: Account['userId'],
  provider: Account['provider'],
): Promise<void> {
  await db
    .delete(accounts)
    .where(and(eq(accounts.userId, userId), eq(accounts.provider, provider)));
}

export { type Account, getUserAccounts, createAccount, deleteAccount };
