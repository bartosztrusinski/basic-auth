import { auth, currentUser } from './session';
import config from '@/auth/config';

async function GET(_: Request, { params }: { params: Promise<{ endpoint: string }> }) {
  const { endpoint } = await params;

  if (endpoint === config.apiSessionEndpoint) {
    return getSession();
  }

  if (endpoint === config.apiUserEndpoint) {
    return getCurrentUser();
  }
}

async function getSession() {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  return Response.json({
    isLoggedIn,
    userId,
    userRole,
    expirationTime,
  });
}

async function getCurrentUser() {
  const backendUser = await currentUser();

  return Response.json(
    backendUser
      ? {
          id: backendUser.id,
          email: backendUser.email,
          name: backendUser.name,
        }
      : null,
  );
}

export const handlers = {
  GET,
};
