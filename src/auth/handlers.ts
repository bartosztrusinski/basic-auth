import { auth } from './session';

async function GET() {
  const { userId, userRole, expirationTime } = await auth();
  const isLoggedIn = Boolean(userId);

  return Response.json({
    isLoggedIn,
    userId,
    userRole,
    expirationTime,
  });
}

export const handlers = {
  GET,
};
