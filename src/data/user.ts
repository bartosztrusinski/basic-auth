import 'server-only';
import { and, eq, exists, isNull, type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { accounts, roles, users } from '@/db/schema';
import { type Account } from './account';

const UserRoles = roles.enumValues;

type User = InferSelectModel<typeof users>;
type InsertUser = InferInsertModel<typeof users>;

async function getUsers(): Promise<User[]> {
  return await db.query.users.findMany({
    limit: 20,
  });
}

async function getUserByEmail(email: User['email']): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.email, email),
  });

  return user ?? null;
}

async function getUserById(id: User['id']): Promise<User | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
  });

  return user ?? null;
}

async function getUserByProvider(
  provider: Account['provider'],
  providerAccountId: Account['providerAccountId'],
): Promise<(User & { accounts: Account[] }) | null> {
  const account = db
    .select()
    .from(accounts)
    .where(
      and(
        eq(accounts.provider, provider),
        eq(accounts.providerAccountId, providerAccountId),
        eq(accounts.userId, users.id),
      ),
    );

  const user = await db.query.users.findFirst({
    with: { accounts: true },
    where: exists(account),
  });

  return user ?? null;
}

async function createUser(
  newUser: Omit<InsertUser, 'id' | 'createdAt'>,
  dbInstance: DbInstance = db,
): Promise<User['id'] | null> {
  const [user] = await dbInstance.insert(users).values(newUser).returning({ id: users.id });
  return user?.id ?? null;
}

/**
 * Upsert a user with email marked as verified.
 * Creates a new user or updates an existing unverified user.
 * If email is already taken (registered and verified) it returns null
 */
async function upsertVerifiedUser(
  { email, ...userData }: Omit<InsertUser, 'id' | 'createdAt' | 'emailVerified'>,
  dbInstance: DbInstance = db,
): Promise<User['id'] | null> {
  const data = { ...userData, emailVerified: new Date() };

  const [user] = await dbInstance
    .insert(users)
    .values({ email, ...data })
    .onConflictDoUpdate({
      target: users.email,
      setWhere: isNull(users.emailVerified),
      set: data,
    })
    .returning({ id: users.id });

  return user?.id ?? null;
}

async function updateUser(
  id: User['id'],
  updatedUser: Partial<Omit<InsertUser, 'id'>>,
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.update(users).set(updatedUser).where(eq(users.id, id));
}

async function deleteUser(id: User['id'], dbInstance: DbInstance = db): Promise<void> {
  await dbInstance.delete(users).where(eq(users.id, id));
}

export {
  UserRoles,
  type User,
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByProvider,
  createUser,
  upsertVerifiedUser,
  updateUser,
  deleteUser,
};
