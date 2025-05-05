import 'server-only';
import { randomUUID, type UUID } from 'node:crypto';
import { createTable } from '@/db/util';
import { getAccountByProvider, type Account } from '@/db/account';

const UserRoles = ['user', 'admin'] as const;

type User = {
  id: UUID;
  email: string;
  emailVerified?: number;
  name: string;
  role: (typeof UserRoles)[number];
  password?: string;
  salt?: string;
};

const [getUsers, writeUsers] = createTable<User>('users.json');

async function getUserByEmail(email: User['email']) {
  const users = await getUsers();
  return users.find((user) => user.email === email);
}

async function getUserById(id: User['id']) {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

async function getUserByProvider(
  provider: Account['provider'],
  providerAccountId: Account['providerAccountId'],
): Promise<(User & { account: Account }) | null> {
  const account = await getAccountByProvider(provider, providerAccountId);

  if (!account) {
    return null;
  }

  const user = await getUserById(account.userId);

  if (!user) {
    return null;
  }

  return { ...user, account };
}

async function createUser(newUser: Omit<User, 'id' | 'role'>) {
  const existingUser = await getUserByEmail(newUser.email);

  if (existingUser) {
    throw new Error('Email already in use');
  }

  const user: User = {
    id: randomUUID(),
    role: 'user',
    ...newUser,
  };

  await writeUsers((users) => [...users, user]);

  return user;
}

async function updateUser(id: User['id'], updatedUserData: Partial<Omit<User, 'id'>>) {
  const currentUser = await getUserById(id);

  if (!currentUser) {
    throw new Error('User not found');
  }

  const updatedUser = {
    ...currentUser,
    ...updatedUserData,
  };

  await writeUsers((users) => users.map((user) => (user.id === id ? updatedUser : user)));

  return updatedUser;
}

export {
  UserRoles,
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByProvider,
  createUser,
  updateUser,
};
export type { User };
