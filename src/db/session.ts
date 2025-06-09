import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { sessions } from '@/db/schema';
import server from '@/auth/config/server';

type Session = InferSelectModel<typeof sessions>;

async function getSessionById(id: Session['id']): Promise<Session | null> {
  const session = await db.query.sessions.findFirst({
    where: and(eq(sessions.id, id), gt(sessions.expiresAt, new Date())),
  });

  return session ?? null;
}

async function createSession(newSession: Omit<Session, 'expiresAt'>): Promise<Session | null> {
  const [session] = await db
    .insert(sessions)
    .values({ ...newSession, expiresAt: createSessionExpirationTime() })
    .returning();

  return session ?? null;
}

async function refreshSession(sessionId: Session['id']): Promise<Session | null> {
  const [session] = await db
    .update(sessions)
    .set({ expiresAt: createSessionExpirationTime() })
    .where(eq(sessions.id, sessionId))
    .returning();

  return session ?? null;
}

async function deleteSession(sessionId: Session['id']): Promise<void> {
  await db.delete(sessions).where(eq(sessions.id, sessionId));
}

async function deleteUserSessions(userId: Session['userId']): Promise<void> {
  await db.delete(sessions).where(eq(sessions.userId, userId));
}

function createSessionExpirationTime(): Date {
  return new Date(Date.now() + server.sessionExpirationInSeconds * 1000);
}

export {
  type Session,
  getSessionById,
  createSession,
  refreshSession,
  deleteSession,
  deleteUserSessions,
};
