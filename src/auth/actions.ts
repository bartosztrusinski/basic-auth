'use server';

import { redirect } from 'next/navigation';
import { env } from '@/env';
import { db, type OAuthProvider, type Session } from '@/db';
import { loginSchema } from '@/schemas';
import { createUserSession, deleteUserSession } from './session';
import { comparePasswords } from './password';
import config from './config';

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export type ActionState<T extends Record<string, unknown> = {}> = {
  isSuccess: boolean;
  errors?: string[];
} & T;

type LoginActionState = ActionState<{ session?: Session }>;

export async function logIn(_: LoginActionState, formData: FormData): Promise<LoginActionState> {
  const { data, error } = loginSchema.safeParse(Object.fromEntries(formData.entries()));

  if (error) {
    return {
      isSuccess: false,
      errors: error.errors.map((err) => err.message),
    };
  }

  const { email, password } = data;

  try {
    const user = await db.getUserByEmail(email);

    if (!user?.password || !user?.salt) {
      return {
        isSuccess: false,
        errors: ['Invalid email or password'],
      };
    }

    const isCorrectPassword = await comparePasswords(password, user.password, user.salt);

    if (!isCorrectPassword) {
      return {
        isSuccess: false,
        errors: ['Invalid email or password'],
      };
    }

    const session = await createUserSession({ userId: user.id, userRole: user.role });

    return {
      isSuccess: true,
      session,
    };
  } catch (error) {
    return {
      isSuccess: false,
      errors: [error instanceof Error ? error.message : 'An unknown error occurred'],
    };
  }
}

export async function oAuthLogIn(provider: OAuthProvider) {
  const url = new URL('https://discord.com/oauth2/authorize');
  const responseType = 'code';
  const clientId = env.DISCORD_CLIENT_ID;
  const scope = 'identify email';
  const redirectUri = `${env.BASE_URL}${config.apiBaseRoute}/${config.apiOAuthEndpoint}/${provider}`;

  url.searchParams.set('response_type', responseType);
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', scope);
  url.searchParams.set('redirect_uri', redirectUri);

  redirect(url.toString());
}

export async function logOut() {
  await deleteUserSession();
}
