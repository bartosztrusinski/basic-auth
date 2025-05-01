import config from '@/auth/config';
import { Email } from '@/auth/components/emails/email';

type Props = {
  name: string;
};

export function ExistingUserLoginGuidanceEmail({ name }: Props) {
  return (
    <Email previewText='Log in using your existing credentials to access your account.'>
      <Email.Heading>Log in to Your Existing Account</Email.Heading>
      <Email.Text>Hi {name},</Email.Text>
      <Email.Text>
        We received a request related to this email address for {config.appName}. An account
        associated with this email address already exists and is active. If this was you trying to
        sign up again, please log in using your existing credentials.
      </Email.Text>
      <Email.Button href={config.baseUrl + config.loginRoute}>Log In</Email.Button>
      <Email.MutedText>
        If you didn&apos;t attempt to sign up or perform this action, you can safely ignore this
        email. Your account remains secure.
      </Email.MutedText>
      <Email.Footer />
    </Email>
  );
}

export function ExistingUserLoginGuidanceEmailPlainText({ name }: Props) {
  return `Hi ${name},\n\n
      We received a request related to this email address for ${config.appName}. 
      An account associated with this email address already exists and is active. 
      If this was you trying to sign up again, please log in using your existing credentials:\n\n
      ${config.baseUrl + config.loginRoute}\n\n
      If you didn't attempt to sign up or perform this action, you can safely ignore this email. Your account remains secure.
      ${new Date().getFullYear()} ${config.appName}. All rights reserved.`;
}

ExistingUserLoginGuidanceEmail.PreviewProps = {
  name: 'Bartosz Trusiński',
} satisfies Props;

export default ExistingUserLoginGuidanceEmail;
