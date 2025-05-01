import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Link,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import config from '@/auth/config';

type Props = {
  name: string;
  verificationUrl: string;
  expirationTimeHours: number;
};

export function VerificationEmail({ name, verificationUrl, expirationTimeHours }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className='bg-zinc-100 p-[8px]'>
          <Preview>
            Welcome to {config.appName}! Verify your email address to activate your account.
          </Preview>
          <Container className='rounded-[4px] border border-solid border-zinc-300 bg-white p-[20px] pb-[5px] font-sans text-zinc-900 shadow'>
            <Img src={`${config.baseUrl}/${config.logoFilename}`} width={48} height={48} />
            <Section>
              <Heading as='h1' className='text-[24px] leading-[32px]'>
                Welcome to {config.appName}!
              </Heading>
              <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>Hi {name},</Text>
              <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>
                Thanks for signing up. Please click the button below to verify your email address
                and activate your account.
              </Text>
              <Section className='py-[12px] text-center'>
                <Button
                  href={verificationUrl}
                  className='rounded-[4px] bg-amber-500 px-[32px] py-[12px] text-[15px] font-bold text-zinc-700 no-underline'
                >
                  Activate Account
                </Button>
              </Section>
              <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>
                This verification link will expire in {expirationTimeHours} hour
                {expirationTimeHours !== 1 && 's'}.
                <br />
                Having trouble clicking the button? Click{' '}
                <Link href={verificationUrl} className='font-medium text-indigo-600'>
                  here
                </Link>
                .
              </Text>
              <Text className='text-[14px] leading-[16px] text-zinc-500'>
                If you did not sign up for {config.appName}, please ignore this email.
              </Text>
              <Hr />
              <Text className='text-center text-[14px] leading-[16px] text-zinc-500'>
                &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
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
