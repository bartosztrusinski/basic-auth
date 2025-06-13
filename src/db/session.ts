import 'server-only';
import { and, eq, gt, type InferSelectModel } from 'drizzle-orm';
import { db } from '@/db';
import { type User } from '@/db/user';
import { sessions } from '@/db/schema';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type Session = InferSelectModel<typeof sessions>;

async function getSessionById(
  id: Session['id'],
): Promise<(Session & { userRole: User['role'] }) | null> {
  const session = await db.query.sessions.findFirst({
    with: { user: { columns: { role: true } } },
    where: and(eq(sessions.id, id), gt(sessions.expiresAt, new Date().toISOString())),
  });

  return session ? { ...session, userRole: session.user.role } : null;
}

async function createSession(newSession: Omit<Session, 'expiresAt'>): Promise<Session | null> {
  const [session] = await db
    .insert(sessions)
    .values({
      ...newSession,
      expiresAt: createExpirationDate(serverConfig.sessionExpirationInSeconds).toISOString(),
    })
    .returning();

  return session ?? null;
}

async function refreshSession(sessionId: Session['id']): Promise<Session | null> {
  const [session] = await db
    .update(sessions)
    .set({ expiresAt: createExpirationDate(serverConfig.sessionExpirationInSeconds).toISOString() })
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

export {
  type Session,
  getSessionById,
  createSession,
  refreshSession,
  deleteSession,
  deleteUserSessions,
};
