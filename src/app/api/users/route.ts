import { AuthError, verifyAccessToken } from '@/auth';
import { db } from '@/db';

export async function PATCH(request: Request) {
  const { name } = (await request.json()) as { name?: string };
  const accessToken = request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!name) {
    return Response.json(null, { status: 400, statusText: 'Name is required' });
  }

  if (!accessToken) {
    throw new AuthError('Unauthorized');
  }

  try {
    const { userId } = await verifyAccessToken(accessToken);
    const user = await db.updateUser(userId, name);
    const publicUser = {
      id: user.id,
      email: user.email,
      name: user.name,
    };

    return Response.json(publicUser);
  } catch (error) {
    if (error instanceof AuthError) {
      return Response.json(null, { status: 401, statusText: 'Unauthorized' });
    }

    return Response.json(null, { status: 500, statusText: 'Internal Server Error' });
  }
}
