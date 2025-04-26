import 'server-only';
import { Resend } from 'resend';
import { env } from '@/env';
import { type VerificationToken } from '@/db';
import { VerificationEmail } from './components/emails/verification-email';
import config from './config';
import serverConfig from './config/server';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: VerificationToken['email'],
  token: VerificationToken['token'],
  name: string,
) {
  const expirationTimeHours = serverConfig.verificationTokenExpirationInSeconds / 60 / 60;
  const url = new URL(config.emailVerificationRoute, env.BASE_URL);

  url.searchParams.set(config.verificationTokenKey, token);

  try {
    const { error } = await resend.emails.send({
      from: `${config.appName} <${serverConfig.fromEmailAddress}>`,
      to: email,
      subject: 'Verify your email address to activate your account',
      react: VerificationEmail({
        verificationUrl: url.toString(),
        name,
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
