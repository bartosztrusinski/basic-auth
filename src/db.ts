import 'server-only';
import fs from 'node:fs/promises';
import { randomUUID, type UUID } from 'node:crypto';

const DATA_PATH = `${process.cwd()}/src/data`;

// ======== USER =========

type User = {
  id: UUID;
  email: string;
  name: string;
  password: string;
};

async function readUsers() {
  const data = await fs.readFile(`${DATA_PATH}/users.json`, 'utf-8');
  return JSON.parse(data) as User[];
}

async function writeUsers(users: User[]) {
  await fs.writeFile(`${DATA_PATH}/users.json`, JSON.stringify(users, null, 2));
}

async function createUser(newUser: Omit<User, 'id'>) {
  const existingUser = await getUserByEmail(newUser.email);

  if (existingUser) {
    throw new Error('Email already in use');
  }

  const user = {
    ...newUser,
    id: randomUUID(),
  };

  const users = await readUsers();
  await writeUsers([...users, user]);

  return user;
}

async function updateUser(id: User['id'], name: User['name']) {
  const currentUser = await getUserById(id);

  if (!currentUser) {
    throw new Error('User not found');
  }

  currentUser.name = name;

  const users = await readUsers();
  const updatedUsers = users.map((user) => (user.id === id ? currentUser : user));
  await writeUsers(updatedUsers);

  return currentUser;
}

async function getUsers() {
  try {
    return await readUsers();
  } catch {
    return [];
  }
}

async function getUserByEmail(email: User['email']) {
  const users = await getUsers();
  return users.find((user) => user.email === email);
}

async function getUserById(id: User['id']) {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

// ======== SESSION =========

type Session = {
  id: UUID;
  userId: User['id'];
  expirationTime: Date;
};

async function readSession() {
  const data = await fs.readFile(`${DATA_PATH}/session.json`, 'utf-8');
  return JSON.parse(data) as Session[];
}

async function writeSession(refreshTokens: Session[]) {
  await fs.writeFile(`${DATA_PATH}/session.json`, JSON.stringify(refreshTokens, null, 2));
  // TODO remove
  console.table(await readSession());
}

async function createSession(newRefreshToken: Omit<Session, 'id'>) {
  const refreshToken: Session = {
    ...newRefreshToken,
    id: randomUUID(),
  };

  const refreshTokens = await getSession();

  await writeSession([...refreshTokens, refreshToken]);

  return refreshToken;
}

async function deleteSession(id: Session['id']) {
  const refreshTokens = await getSession();
  const updatedRefreshTokens = refreshTokens.filter((token) => token.id !== id);
  await writeSession(updatedRefreshTokens);
}

async function deleteUserSession(userId: User['id']) {
  const refreshTokens = await getSession();
  const updatedRefreshTokens = refreshTokens.filter((token) => token.userId !== userId);
  await writeSession(updatedRefreshTokens);
}

async function deleteExpiredUserSession(userId: User['id']) {
  const refreshTokens = await getSession();
  const now = new Date();
  const updatedRefreshTokens = refreshTokens.filter(
    (token) => token.userId !== userId || new Date(token.expirationTime) > now,
  );
  await writeSession(updatedRefreshTokens);
}

async function getSession() {
  try {
    return await readSession();
  } catch {
    return [];
  }
}

async function getSessionById(id: Session['id']) {
  const refreshTokens = await getSession();
  return refreshTokens.find((token) => token.id === id);
}

export const db = {
  createUser,
  updateUser,
  getUsers,
  getUserByEmail,
  getUserById,
  createSession,
  deleteSession,
  deleteUserSession,
  deleteExpiredUserSession,
  getSession,
  getSessionById,
};

export type { Session, User };
