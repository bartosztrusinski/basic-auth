import 'server-only';
import fs from 'node:fs/promises';
import { randomUUID, type UUID } from 'node:crypto';
import { type OAuthProvider } from '@/auth/oauth/types';

const DATA_PATH = `${process.cwd()}/src/data`;

// ======== USER =========

type User = {
  id: UUID;
  email: string;
  name: string;
  role: 'user' | 'admin';
  password?: string;
  salt?: string;
};

async function readUsers() {
  const data = await fs.readFile(`${DATA_PATH}/users.json`, 'utf-8');
  return JSON.parse(data || '[]') as User[];
}

async function writeUsers(users: User[]) {
  await fs.writeFile(`${DATA_PATH}/users.json`, JSON.stringify(users, null, 2));
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

  const users = await readUsers();
  await writeUsers([...users, user]);

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

  const users = await readUsers();
  const updatedUsers = users.map((user) => (user.id === id ? updatedUser : user));
  await writeUsers(updatedUsers);

  return updatedUser;
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

  return {
    ...user,
    account,
  };
}

// ======= ACCOUNT =========

type Account = {
  userId: User['id'];
  provider: OAuthProvider;
  providerAccountId: string;
};

async function readAccounts() {
  const data = await fs.readFile(`${DATA_PATH}/accounts.json`, 'utf-8');
  return JSON.parse(data || '[]') as Account[];
}

async function writeAccounts(accounts: Account[]) {
  await fs.writeFile(`${DATA_PATH}/accounts.json`, JSON.stringify(accounts, null, 2));
}

async function getAccounts() {
  try {
    return await readAccounts();
  } catch {
    return [];
  }
}

async function getUserAccounts(userId: User['id']) {
  const accounts = await getAccounts();
  return accounts.filter((account) => account.userId === userId);
}

async function getAccountByProvider(
  provider: Account['provider'],
  providerAccountId: Account['providerAccountId'],
) {
  const accounts = await getAccounts();
  return accounts.find(
    (account) => account.provider === provider && account.providerAccountId === providerAccountId,
  );
}

async function createAccount(newAccount: Account) {
  const accounts = await readAccounts();
  const isExistingAccount = accounts.some(
    ({ provider, providerAccountId }) =>
      provider === newAccount.provider && providerAccountId === newAccount.providerAccountId,
  );

  if (isExistingAccount) {
    return null;
  }

  await writeAccounts([...accounts, newAccount]);

  return newAccount;
}

async function deleteAccount(userId: User['id'], provider: Account['provider']) {
  const accounts = await getAccounts();
  const updatedAccounts = accounts.filter(
    (account) => !(account.userId === userId && account.provider === provider),
  );

  await writeAccounts(updatedAccounts);
}

// ======== SESSION =========

type Session = {
  id: string;
  userId: User['id'];
  userRole: User['role'];
  expirationTime: number;
};

async function readSessions() {
  const data = await fs.readFile(`${DATA_PATH}/session.json`, 'utf-8');
  return JSON.parse(data || '[]') as Session[];
}

async function writeSessions(sessions: Session[]) {
  await fs.writeFile(`${DATA_PATH}/session.json`, JSON.stringify(sessions, null, 2));
}

async function createSession(newSession: Session) {
  const sessions = await getSessions();
  const now = Date.now();
  const nonExpiredSessions = sessions.filter((session) => session.expirationTime > now);

  await writeSessions([...nonExpiredSessions, newSession]);

  return newSession;
}

async function deleteSession(id: Session['id']) {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter((session) => session.id !== id);
  await writeSessions(updatedSessions);
}

async function updateSession(
  sessionId: Session['id'],
  updatedSessionData: Partial<Omit<Session, 'id'>>,
) {
  const currentSession = await getSessionById(sessionId);

  if (!currentSession) {
    throw new Error('Session not found');
  }

  const updatedSession = {
    ...currentSession,
    ...updatedSessionData,
  };

  const sessions = await getSessions();
  const updatedSessions = sessions.map((session) =>
    session.id === sessionId ? updatedSession : session,
  );
  await writeSessions(updatedSessions);

  return updatedSession;
}

async function deleteUserSession(userId: User['id']) {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter((session) => session.userId !== userId);
  await writeSessions(updatedSessions);
}

async function getSessions() {
  try {
    return await readSessions();
  } catch {
    return [];
  }
}

async function getSessionById(id: Session['id']) {
  const sessions = await getSessions();
  const session = sessions.find((session) => session.id === id);

  if (!session) {
    return null;
  }

  if (session.expirationTime < Date.now()) {
    await deleteSession(id);
    return null;
  }

  return session;
}

// ======= VERIFICATION TOKENS =========

type VerificationToken = {
  email: User['email'];
  token: string;
  expirationTime: number;
};

async function readVerificationTokens() {
  const data = await fs.readFile(`${DATA_PATH}/verification-tokens.json`, 'utf-8');
  const tokens = JSON.parse(data || '[]') as VerificationToken[];
  const now = Date.now();
  const nonExpiredTokens = tokens.filter((token) => token.expirationTime > now);

  return nonExpiredTokens;
}

async function writeVerificationTokens(tokens: VerificationToken[]) {
  await fs.writeFile(`${DATA_PATH}/verification-tokens.json`, JSON.stringify(tokens, null, 2));
}

async function createVerificationToken(newToken: VerificationToken) {
  const tokens = await readVerificationTokens();

  await writeVerificationTokens([...tokens, newToken]);

  return newToken;
}

async function deleteVerificationToken(email: VerificationToken['email']) {
  const tokens = await readVerificationTokens();
  const updatedTokens = tokens.filter((token) => token.email !== email);

  await writeVerificationTokens(updatedTokens);
}

async function getVerificationTokenByEmail(email: VerificationToken['email']) {
  const verificationTokens = await readVerificationTokens();
  const verificationToken = verificationTokens.find((token) => token.email === email);

  if (!verificationToken) {
    return null;
  }

  return verificationToken;
}

async function getVerificationTokenByToken(token: VerificationToken['token']) {
  const verificationTokens = await readVerificationTokens();
  const verificationToken = verificationTokens.find(
    (verificationToken) => verificationToken.token === token,
  );

  if (!verificationToken) {
    return null;
  }

  return verificationToken;
}

export const db = {
  createUser,
  updateUser,
  getUsers,
  getUserByEmail,
  getUserById,
  getUserByProvider,
  createAccount,
  deleteAccount,
  getUserAccounts,
  getAccountByProvider,
  createSession,
  updateSession,
  deleteSession,
  deleteUserSession,
  getSessions,
  getSessionById,
  createVerificationToken,
  deleteVerificationToken,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
};

export type { Session, User, Account, VerificationToken };
