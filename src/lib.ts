import { cookies } from 'next/headers';
import { NextResponse, type NextRequest } from 'next/server';
import { type ResponseCookie } from 'next/dist/compiled/@edge-runtime/cookies';
import { jwtVerify, SignJWT, type JWTPayload } from 'jose';
import { users, type User } from '@/data';

interface Session extends JWTPayload {
  user: Pick<User, 'email' | 'name'>;
  expires: Date;
}

const ALG = 'HS256';
const SECRET_KEY = new TextEncoder().encode(process.env.SECRET);
const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME ?? 'basic-auth-session';
const EXPIRATION_TIME =
  (process.env.EXPIRATION_TIME_SECONDS ? parseInt(process.env.EXPIRATION_TIME_SECONDS) : 10) * 1000;
const COOKIE_DEFAULT_FLAGS: Partial<ResponseCookie> = {
  httpOnly: true,
  secure: true,
  sameSite: 'strict',
};

const getFreshExpirationTime = () => new Date(Date.now() + EXPIRATION_TIME);

export class AuthError extends Error {
  constructor(message?: string) {
    super(message ?? 'Authentication error');
    this.name = 'AuthError';
  }
}

export async function encrypt<T extends JWTPayload>(payload: T): Promise<string> {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: ALG })
    .setIssuedAt()
    .setExpirationTime(getFreshExpirationTime())
    .sign(SECRET_KEY);
}

export async function decrypt<T extends JWTPayload>(token: string): Promise<T> {
  const { payload } = await jwtVerify<T>(token, SECRET_KEY, {
    algorithms: [ALG],
  });

  return payload;
}

export async function signIn(formData: FormData) {
  const email = formData.get('email');
  const password = formData.get('password');

  const user = users.find((user) => user.email === email);

  if (!user || user.password !== password) {
    throw new AuthError('Invalid credentials');
  }

  const expires = getFreshExpirationTime();
  const session = await encrypt<Session>({
    user: {
      email: user.email,
      name: user.name,
    },
    expires,
  });
  const cookieStore = await cookies();

  cookieStore.set(SESSION_COOKIE_NAME, session, {
    expires,
    ...COOKIE_DEFAULT_FLAGS,
  });

  return new Response('Logged in', { status: 200 });
}

export async function signOut() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE_NAME);

  return new Response('Logged out', { status: 200 });
}

export async function getSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return null;
  }

  return await decrypt<Session>(sessionCookie.value);
}

export async function refreshSession(request: NextRequest) {
  const sessionCookie = request.cookies.get(SESSION_COOKIE_NAME);

  if (!sessionCookie) {
    return;
  }

  const session = await decrypt<Session>(sessionCookie.value);
  const refreshedExpires = getFreshExpirationTime();
  const response = NextResponse.next();

  session.expires = refreshedExpires;
  response.cookies.set({
    name: SESSION_COOKIE_NAME,
    value: await encrypt(session),
    expires: refreshedExpires,
    ...COOKIE_DEFAULT_FLAGS,
  });

  return response;
}
