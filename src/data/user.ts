import 'server-only';
import {
  and,
  eq,
  exists,
  isNull,
  sql,
  type InferInsertModel,
  type InferSelectModel,
} from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { accounts, roles, users } from '@/db/schema';
import { type Account } from './account';

const UserRoles = roles.enumValues;

type User = InferSelectModel<typeof users>;
type InsertUser = InferInsertModel<typeof users>;

async function getUsers(): Promise<Pick<User, 'id' | 'name' | 'role' | 'createdAt'>[]> {
  return await db.query.users.findMany({
    limit: 20,
    columns: { id: true, name: true, role: true, createdAt: true },
  });
}

const preparedGetUserByEmail = db.query.users
  .findFirst({ where: eq(users.email, sql.placeholder('email')) })
  .prepare('get_user_by_email');

async function getUserByEmail(email: User['email']): Promise<User | null> {
  const user = await preparedGetUserByEmail.execute({ email });
  return user ?? null;
}

const preparedGetUserById = db.query.users
  .findFirst({ where: eq(users.id, sql.placeholder('id')) })
  .prepare('get_user_by_id');

async function getUserById(id: User['id']): Promise<User | null> {
  const user = await preparedGetUserById.execute({ id });
  return user ?? null;
}

async function getUserWithAccounts(
  id: User['id'],
): Promise<(Pick<User, 'id' | 'password'> & { accounts: Pick<Account, 'provider'>[] }) | null> {
  const user = await db.query.users.findFirst({
    where: eq(users.id, id),
    columns: { id: true, password: true },
    with: { accounts: { columns: { provider: true } } },
  });

  return user ?? null;
}

const getUserByProviderSubquery = db
  .select()
  .from(accounts)
  .where(
    and(
      eq(accounts.provider, sql.placeholder('provider')),
      eq(accounts.providerAccountId, sql.placeholder('providerAccountId')),
      eq(accounts.userId, users.id),
    ),
  );

const preparedGetUserByProvider = db.query.users
  .findFirst({
    where: exists(getUserByProviderSubquery),
    columns: { id: true },
  })
  .prepare('get_user_by_provider');

async function getUserByProvider(
  provider: Account['provider'],
  providerAccountId: Account['providerAccountId'],
): Promise<User['id'] | null> {
  const user = await preparedGetUserByProvider.execute({ provider, providerAccountId });
  return user?.id ?? null;
}

async function createUser(
  newUser: Omit<InsertUser, 'id' | 'createdAt'>,
  dbInstance: DbInstance = db,
): Promise<User['id'] | null> {
  const [user] = await dbInstance.insert(users).values(newUser).returning();
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
    .returning();

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
  getUserWithAccounts,
  getUserByProvider,
  createUser,
  upsertVerifiedUser,
  updateUser,
  deleteUser,
};
