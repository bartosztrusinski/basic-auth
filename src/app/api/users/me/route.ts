import { AuthError, verifyAccessToken } from '@/auth';
import { db } from '@/db';

export async function GET(request: Request) {
  const accessToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!accessToken) {
    return Response.json({ error: 'Unauthorized' }, { status: 403 });
  }

  try {
    const { userId } = await verifyAccessToken(accessToken);
    const user = await db.getUserById(userId);

    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }

    const publicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return Response.json(publicUser);
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    return Response.json({ error: 'Internal server error' }, { status: 500 });
  }
}
