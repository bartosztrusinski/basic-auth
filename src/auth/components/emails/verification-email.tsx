import { Link } from '@react-email/components';
import config from '@/auth/config';
import { Email } from '@/auth/components/emails/email';

type Props = {
  name: string;
  verificationUrl: string;
  expirationTimeHours: number;
};

export function VerificationEmail({ name, verificationUrl, expirationTimeHours }: Props) {
  return (
    <Email
      previewText={`Welcome to ${config.appName}! Verify your email address to activate your account.`}
    >
      <Email.Heading>Welcome to {config.appName}!</Email.Heading>
      <Email.Text>Hi {name},</Email.Text>
      <Email.Text>
        Thanks for signing up. Please click the button below to verify your email address and
        activate your account.
      </Email.Text>
      <Email.Button href={verificationUrl}>Activate Account</Email.Button>
      <Email.Text>
        This verification link will expire in {expirationTimeHours} hour
        {expirationTimeHours !== 1 && 's'}.
        <br />
        Having trouble clicking the button? Click{' '}
        <Link href={verificationUrl} className='font-medium text-indigo-700'>
          here
        </Link>
        .
      </Email.Text>
      <Email.MutedText>
        If you did not sign up for {config.appName}, please ignore this email.
      </Email.MutedText>
      <Email.Footer />
    </Email>
  );
}

export const VerificationEmailPlainText = ({
  name,
  verificationUrl,
  expirationTimeHours,
}: Props) => {
  return `Hi ${name},\n\n
      Thanks for signing up. Please click the link below to verify your email address and activate your account.\n\n
      ${verificationUrl}\n\n
      This verification link will expire in ${expirationTimeHours} hour${expirationTimeHours !== 1 ? 's' : ''}.\n\n
      If you did not sign up for ${config.appName}, please ignore this email.
      ${new Date().getFullYear()} ${config.appName}. All rights reserved.`;
};

VerificationEmail.PreviewProps = {
  name: 'Bartosz Trusiński',
  expirationTimeHours: 24,
  verificationUrl:
    'https://basic-auth.dev/verify-email?token=13409523-40967134-08652345-092348503-94682340-96234586-24568-245',
} satisfies Props;

export default VerificationEmail;
