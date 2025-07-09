import 'server-only';
import { and, eq, gt, sql, type InferSelectModel } from 'drizzle-orm';
import { db, type DbInstance } from '@/db';
import { type User } from '@/data/user';
import { sessions } from '@/db/schema';
import { createExpirationDate } from '@/util';
import serverConfig from '@/auth/config/server';

type Session = InferSelectModel<typeof sessions>;

const preparedGetSessionByToken = db.query.sessions
  .findFirst({
    with: { user: { columns: { role: true } } },
    where: and(
      eq(sessions.token, sql.placeholder('token')),
      gt(sessions.expiresAt, sql.placeholder('now')),
    ),
  })
  .prepare('get_session_by_token');

async function getSessionByToken(
  token: Session['token'],
): Promise<(Session & { userRole: User['role'] }) | null> {
  const now = new Date().toISOString();
  const session = await preparedGetSessionByToken.execute({ token, now });

  return session ? { ...session, userRole: session.user.role } : null;
}

async function createSession(
  newSession: Omit<Session, 'expiresAt'>,
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.insert(sessions).values({
    ...newSession,
    expiresAt: createExpirationDate(serverConfig.sessionExpirationInSeconds).toISOString(),
  });
}

async function refreshSession(token: Session['token'], dbInstance: DbInstance = db): Promise<void> {
  await dbInstance
    .update(sessions)
    .set({ expiresAt: createExpirationDate(serverConfig.sessionExpirationInSeconds).toISOString() })
    .where(eq(sessions.token, token));
}

async function deleteSession(token: Session['token'], dbInstance: DbInstance = db): Promise<void> {
  await dbInstance.delete(sessions).where(eq(sessions.token, token));
}

async function deleteUserSessions(
  userId: Session['userId'],
  dbInstance: DbInstance = db,
): Promise<void> {
  await dbInstance.delete(sessions).where(eq(sessions.userId, userId));
}

export {
  type Session,
  getSessionByToken,
  createSession,
  refreshSession,
  deleteSession,
  deleteUserSessions,
};
