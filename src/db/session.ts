import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';

type Session = {
  id: string;
  userId: User['id'];
  userRole: User['role'];
  expirationTime: number;
};

const [getSessions, writeSessions] = createTable<Session>('session.json');

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

async function createSession(newSession: Session) {
  await writeSessions((sessions) => {
    const now = Date.now();
    const nonExpiredSessions = sessions.filter((session) => session.expirationTime > now);
    return [...nonExpiredSessions, newSession];
  });

  return newSession;
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

  await writeSessions((sessions) =>
    sessions.map((session) => (session.id === sessionId ? updatedSession : session)),
  );

  return updatedSession;
}

async function deleteSession(id: Session['id']) {
  await writeSessions((sessions) => sessions.filter((session) => session.id !== id));
}

async function deleteUserSessions(userId: User['id']) {
  await writeSessions((sessions) => sessions.filter((session) => session.userId !== userId));
}

export {
  getSessions,
  getSessionById,
  createSession,
  updateSession,
  deleteSession,
  deleteUserSessions,
};
export type { Session };
