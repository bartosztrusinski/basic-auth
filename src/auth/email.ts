import 'server-only';
import { Resend } from 'resend';
import { env } from '@/env';
import { type User, type VerificationToken } from '@/db';
import {
  VerificationEmail,
  VerificationEmailPlainText,
} from '@/auth/components/emails/verification-email';
import {
  ExistingUserLoginGuidanceEmail,
  ExistingUserLoginGuidanceEmailPlainText,
} from '@/auth/components/emails/existing-user-login-guidance-email';
import { AuthError } from '@/auth/message';
import config from '@/auth/config';
import serverConfig from '@/auth/config/server';

const resend = new Resend(env.RESEND_API_KEY);

export async function sendVerificationEmail(
  email: VerificationToken['email'],
  token: VerificationToken['token'],
  name: User['name'],
) {
  const expirationTimeHours = serverConfig.verificationTokenExpirationInSeconds / 60 / 60;
  const url = new URL(config.emailVerificationRoute, config.baseUrl);

  url.searchParams.set(config.verificationTokenKey, token);

  const props = {
    verificationUrl: url.toString(),
    name,
    expirationTimeHours,
  };

  try {
    const { error } = await resend.emails.send({
      from: `${config.appName} <${serverConfig.fromEmailAddress}>`,
      to: email,
      subject: 'Verify your email address to activate your account',
      react: VerificationEmail(props),
      text: VerificationEmailPlainText(props),
    });

    if (error) {
      throw new Error(error.message, { cause: error });
    }
  } catch {
    throw new AuthError('verification-email-not-sent');
  }
}

export async function sendExistingUserLoginGuidanceEmail(email: User['email'], name: User['name']) {
  const props = {
    name,
  };

  try {
    const { error } = await resend.emails.send({
      from: `${config.appName} <${serverConfig.fromEmailAddress}>`,
      to: email,
      subject: `You already have an account with ${config.appName}`,
      react: ExistingUserLoginGuidanceEmail(props),
      text: ExistingUserLoginGuidanceEmailPlainText(props),
    });

    if (error) {
      throw new Error(error.message, { cause: error });
    }
  } catch {
    throw new AuthError('verification-email-not-sent');
  }
}
