import 'server-only';
import { Resend } from 'resend';
import { env } from '@/env';
import { type VerificationToken } from '@/db';
import { VerificationEmail } from './components/emails/verification-email';
import { ExistingUserLoginGuidanceEmail } from './components/emails/existing-user-login-guidance-email';
import { getAuthMessage } from './message';
import config from './config';
import serverConfig from './config/server';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: VerificationToken['email'],
  token: VerificationToken['token'],
  name: string,
) {
  const expirationTimeHours = serverConfig.verificationTokenExpirationInSeconds / 60 / 60;
  const url = new URL(config.emailVerificationRoute, config.baseUrl);

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
      // TODO move to component
      text: `Hi ${name},\n\n
      Thanks for signing up. Please click the link below to verify your email address and activate your account.\n\n
      ${url.toString()}\n\n
      This verification link will expire in ${expirationTimeHours} hour${
        expirationTimeHours !== 1 ? 's' : ''
      }.\n\n`,
    });

    if (error) {
      throw new Error(error.message, { cause: error });
    }
  } catch (error) {
    console.error('Error sending email: ', error instanceof Error ? error.cause : error);

    throw new Error(getAuthMessage('verification-email-not-sent').message);
  }
}

export async function sendExistingUserLoginGuidanceEmail(
  email: VerificationToken['email'],
  name: string,
) {
  try {
    const { error } = await resend.emails.send({
      from: `${config.appName} <${serverConfig.fromEmailAddress}>`,
      to: email,
      subject: `You already have an account with ${config.appName}`,
      react: ExistingUserLoginGuidanceEmail({ name }),
      // TODO
      text: `Hi`,
    });

    if (error) {
      throw new Error(error.message, { cause: error });
    }
  } catch (error) {
    console.error('Error sending email: ', error instanceof Error ? error.cause : error);

    throw new Error(getAuthMessage('verification-email-not-sent').message);
  }
}
