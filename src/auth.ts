import 'server-only';
import { cookies, headers } from 'next/headers';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { db, type RefreshToken, type User } from '@/db';
import { env } from '@/env';

const ALG = 'HS256';
export const REFRESH_TOKEN_COOKIE_NAME = 'refresh';
const REFRESH_COOKIE_PATH = '/api/auth';
const ACCESS_TOKEN_SECRET_KEY = new TextEncoder().encode(env.ACCESS_TOKEN_SECRET);
const REFRESH_TOKEN_SECRET_KEY = new TextEncoder().encode(env.REFRESH_TOKEN_SECRET);
const ACCESS_TOKEN_EXPIRATION_TIME = env.ACCESS_TOKEN_EXPIRATION_TIME;
const REFRESH_TOKEN_EXPIRATION_TIME = env.REFRESH_TOKEN_EXPIRATION_TIME;

const COOKIE_DEFAULT_FLAGS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'lax',
};

type AccessTokenPayload = {
  userId: User['id'];
};

type RefreshTokenPayload = {
  userId: User['id'];
  refreshTokenId: RefreshToken['id'];
};

export class AuthError extends Error {
  constructor(message?: string) {
    super(message ?? 'Authentication error');
    this.name = 'AuthError';
  }
}

async function encrypt(
  payload: JWTPayload,
  expirationTime: number,
  secret: Uint8Array,
): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(`${expirationTime}s`)
    .sign(secret);
}

async function verifyToken<T extends JWTPayload>(token: string, secret: Uint8Array): Promise<T> {
  try {
    const { payload } = await jwtVerify<T>(token, secret, { algorithms: [ALG] });
    return payload;
  } catch {
    throw new AuthError('Invalid token');
  }
}

export async function verifyAccessToken(accessToken: string) {
  return await verifyToken<AccessTokenPayload>(accessToken, ACCESS_TOKEN_SECRET_KEY);
}

export async function verifyRefreshToken(refreshToken: string) {
  return await verifyToken<RefreshTokenPayload>(refreshToken, REFRESH_TOKEN_SECRET_KEY);
}

export async function generateTokens(userId: User['id']) {
  const accessToken = await encrypt(
    { userId },
    ACCESS_TOKEN_EXPIRATION_TIME,
    ACCESS_TOKEN_SECRET_KEY,
  );

  const { id: refreshTokenId } = await db.createRefreshToken({
    userId,
    expirationTime: new Date(Date.now() + REFRESH_TOKEN_EXPIRATION_TIME * 1000),
  });

  const refreshToken = await encrypt(
    { userId, refreshTokenId },
    REFRESH_TOKEN_EXPIRATION_TIME,
    REFRESH_TOKEN_SECRET_KEY,
  );

  return { accessToken, refreshToken };
}

export async function setRefreshTokenCookie(refreshToken: string) {
  const cookieStore = await cookies();

  cookieStore.set(REFRESH_TOKEN_COOKIE_NAME, refreshToken, {
    ...COOKIE_DEFAULT_FLAGS,
    path: REFRESH_COOKIE_PATH,
    maxAge: REFRESH_TOKEN_EXPIRATION_TIME,
  });
}

export async function signIn(email: User['email'], password: User['password']) {
  const user = await db.getUserByEmail(email);

  if (!user || user.password !== password) {
    throw new AuthError('Invalid credentials');
  }

  const { accessToken, refreshToken } = await generateTokens(user.id);

  await setRefreshTokenCookie(refreshToken);
  await db.deleteExpiredUserRefreshTokens(user.id);

  return { accessToken };
}

export async function signOut() {
  const cookieStore = await cookies();
  const refreshTokenCookie = cookieStore.get(REFRESH_TOKEN_COOKIE_NAME)?.value;

  if (!refreshTokenCookie) {
    return;
  }

  const { refreshTokenId } = await verifyRefreshToken(refreshTokenCookie);

  await db.deleteRefreshToken(refreshTokenId);
  cookieStore.delete(REFRESH_TOKEN_COOKIE_NAME);
}

export async function auth() {
  const headersList = await headers();
  const accessToken = headersList.get('Authorization')?.split('Bearer ')[1];

  if (!accessToken) {
    return null;
  }

  try {
    const { userId } = await verifyAccessToken(accessToken);
    return { userId };
  } catch {
    return null;
  }
}
