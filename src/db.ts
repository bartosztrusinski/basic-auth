import 'server-only';
import fs from 'node:fs/promises';
import { randomUUID, type UUID } from 'node:crypto';

const DATA_PATH = `${process.cwd()}/src/data`;

// ======== USER =========

type User = {
  id: UUID;
  email: string;
  name: string;
  role: 'user' | 'admin';
  password: string;
  salt: string;
};

async function readUsers() {
  const data = await fs.readFile(`${DATA_PATH}/users.json`, 'utf-8');
  return JSON.parse(data) as User[];
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
    ...newUser,
    id: randomUUID(),
    role: 'user',
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
  userRole: User['role'];
  expirationTime: number;
};

async function readSessions() {
  const data = await fs.readFile(`${DATA_PATH}/session.json`, 'utf-8');
  return JSON.parse(data) as Session[];
}

async function writeSessions(sessions: Session[]) {
  await fs.writeFile(`${DATA_PATH}/session.json`, JSON.stringify(sessions, null, 2));
}

async function createSession(newSession: Omit<Session, 'id'>) {
  const session: Session = {
    ...newSession,
    id: randomUUID(),
  };

  const sessions = await getSessions();

  await writeSessions([...sessions, session]);

  return session;
}

async function deleteSession(id: Session['id']) {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter((session) => session.id !== id);
  await writeSessions(updatedSessions);
}

async function deleteUserSession(userId: User['id']) {
  const sessions = await getSessions();
  const updatedSessions = sessions.filter((session) => session.userId !== userId);
  await writeSessions(updatedSessions);
}

async function deleteExpiredUserSession(userId: User['id']) {
  const sessions = await getSessions();
  const now = new Date();
  const updatedSessions = sessions.filter(
    (session) => session.userId !== userId || new Date(session.expirationTime) > now,
  );
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
  return sessions.find((session) => session.id === id);
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
  getSessions,
  getSessionById,
};

export type { Session, User };
