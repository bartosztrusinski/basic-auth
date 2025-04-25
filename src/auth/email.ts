import 'server-only';
import { Resend } from 'resend';
import { env } from '@/env';
import { type VerificationToken } from '@/db';
import { VerificationEmail } from './components/emails/verification-email';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: VerificationToken['email'],
  token: VerificationToken['token'],
) {
  // TODO add endpoint, key, from email and expiration time to config
  const emailVerificationRoute = 'verify-email';
  const verificationTokenKey = 'token';
  const expirationTimeHours = 1;
  const verificationUrl = new URL(emailVerificationRoute, env.BASE_URL);

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
