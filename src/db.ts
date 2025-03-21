import 'server-only';
import fs from 'node:fs/promises';
import { randomUUID, type UUID } from 'node:crypto';

const DATA_PATH = `${process.cwd()}/src/data`;

// USER

export type User = {
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

export async function createUser(newUser: Omit<User, 'id'>) {
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

export async function updateUser(email: User['email'], name: User['name']) {
  const currentUser = await getUserByEmail(email);

  if (!currentUser) {
    throw new Error('User not found');
  }

  currentUser.name = name;

  const users = await readUsers();
  const updatedUsers = users.map((user) => (user.email === email ? currentUser : user));
  await writeUsers(updatedUsers);

  return currentUser;
}

export async function getUsers() {
  try {
    return await readUsers();
  } catch {
    return [];
  }
}

export async function getUserByEmail(email: User['email']) {
  const users = await getUsers();
  return users.find((user) => user.email === email);
}

export async function getUserById(id: User['id']) {
  const users = await getUsers();
  return users.find((user) => user.id === id);
}

// REFRESH TOKEN

// TODO HASH TOKENS FOR SECURITY
export type RefreshToken = {
  id: UUID;
  userId: User['id'];
  expirationTime: Date;
};

async function readRefreshTokens() {
  const data = await fs.readFile(`${DATA_PATH}/refresh-tokens.json`, 'utf-8');
  return JSON.parse(data) as RefreshToken[];
}

async function writeRefreshTokens(refreshTokens: RefreshToken[]) {
  await fs.writeFile(`${DATA_PATH}/refresh-tokens.json`, JSON.stringify(refreshTokens, null, 2));
}

export async function createRefreshToken(newRefreshToken: Omit<RefreshToken, 'id'>) {
  const refreshToken: RefreshToken = {
    ...newRefreshToken,
    id: randomUUID(),
  };

  const refreshTokens = await getRefreshTokens();

  await writeRefreshTokens([...refreshTokens, refreshToken]);
  console.table(await readRefreshTokens());

  return refreshToken;
}

export async function deleteRefreshToken(id: RefreshToken['id']) {
  const refreshTokens = await getRefreshTokens();

  const newRefreshTokens = refreshTokens.filter((token) => token.id !== id);
  await writeRefreshTokens(newRefreshTokens);
}

export async function getRefreshTokens() {
  try {
    return await readRefreshTokens();
  } catch {
    return [];
  }
}

export async function getRefreshTokenById(id: RefreshToken['id']) {
  const refreshTokens = await getRefreshTokens();
  return refreshTokens.find((token) => token.id === id);
}
