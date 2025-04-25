import 'server-only';
import { redirect } from 'next/navigation';
import { Resend } from 'resend';
import { env } from '@/env';
import { db, type VerificationToken } from '@/db';
import { VerificationEmail } from './components/emails/verification-email';
import { redirectToLogin } from './util';
import config from './config';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: VerificationToken['email'],
  token: VerificationToken['token'],
) {
  // TODO add endpoint, key, from email and expiration time to config
  const emailVerificationEndpoint = 'verify-email';
  const verificationTokenKey = 'token';
  const expirationTimeHours = 1;
  const verificationUrl = new URL(
    `${config.apiBaseRoute}/${emailVerificationEndpoint}`,
    env.BASE_URL,
  );

  verificationUrl.searchParams.set(verificationTokenKey, token);

  try {
    const { error } = await resend.emails.send({
      from: 'Basic Auth <onboarding@resend.dev>',
      to: email,
      subject: 'Welcome to Basic Auth! Please verify your email',
      react: VerificationEmail({
        // TODO name
        name: email,
        verificationUrl: verificationUrl.toString(),
        expirationTimeHours,
      }),
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    console.error('Error sending email: ', error);
    throw new Error('Failed to send verification email. Please try again.');
  }
}

export async function verifyEmail(token: VerificationToken['token']) {
  try {
    const verificationToken = await db.getVerificationTokenByToken(token);

    if (!verificationToken || verificationToken.expirationTime < Date.now()) {
      throw new Error('Invalid or expired verification token');
    }

    const { email } = verificationToken;
    const user = await db.getUserByEmail(email);

    if (!user) {
      throw new Error('Email does not exist');
    }

    if (!user.emailVerified) {
      await db.updateUser(user.id, { emailVerified: Date.now() });
    }

    await db.deleteVerificationToken(verificationToken.email);
  } catch (error) {
    console.error('Error verifying email: ', error);
    const errorMessage = error instanceof Error ? error.message : 'Email verification failed';

    // TODO
    redirect(`/resend-verification?redirect_reason=${encodeURIComponent(errorMessage)}`);
  }

  redirectToLogin({ redirectReason: 'Email verified successfully! You can now log in.' });
}
