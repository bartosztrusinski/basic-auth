import 'server-only';
import { and, eq, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { accounts, roles, users } from '@/db/schema';
import { type Account } from './account';

const UserRoles = roles.enumValues;

type User = InferSelectModel<typeof users>;

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
  const user = await db.query.users.findFirst({
    with: {
      accounts: {
        where: and(
          eq(accounts.provider, provider),
          eq(accounts.providerAccountId, providerAccountId),
        ),
      },
    },
  });

  return user ?? null;
}

async function createUser(
  newUser: Pick<User, 'email' | 'name' | 'password'>,
): Promise<User | null> {
  const [user] = await db.insert(users).values(newUser).returning();
  return user ?? null;
}

async function updateUser(
  id: User['id'],
  updatedUser: Partial<Omit<User, 'id'>>,
): Promise<User | null> {
  const [user] = await db.update(users).set(updatedUser).where(eq(users.id, id)).returning();
  return user ?? null;
}

async function deleteUser(id: User['id']): Promise<void> {
  await db.delete(users).where(eq(users.id, id));
}

export {
  UserRoles,
  type User,
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByProvider,
  createUser,
  updateUser,
  deleteUser,
};
