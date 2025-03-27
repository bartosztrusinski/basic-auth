import { cookies } from 'next/headers';
import { generateTokens, setRefreshTokenCookie, verifyRefreshToken } from '@/auth';
import { db } from '@/db';

export async function POST() {
  const cookieStore = await cookies();

  try {
    const refreshTokenCookie = cookieStore.get('refresh')?.value;

    if (!refreshTokenCookie) {
      throw new Error('No refresh token');
    }

    const { refreshTokenId, userId } = await verifyRefreshToken(refreshTokenCookie);

    const refreshToken = await db.getRefreshTokenById(refreshTokenId);

    if (!refreshToken) {
      await db.deleteUserRefreshTokens(userId);
      throw new Error('Invalid refresh token');
    }

    if (new Date(refreshToken.expirationTime) < new Date()) {
      await db.deleteRefreshToken(refreshToken.id);
      throw new Error('Expired refresh token');
    }

    const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
      refreshToken.userId,
    );

    await setRefreshTokenCookie(newRefreshToken);
    await db.deleteRefreshToken(refreshToken.id);

    return Response.json({ accessToken }, { status: 200 });
  } catch (error) {
    cookieStore.delete('refresh');

    return Response.json(
      { error: error instanceof Error ? error.message : 'Invalid refresh token' },
      { status: 401 },
    );
  }
}
