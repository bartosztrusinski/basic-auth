import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';
import config from '@/auth/config';

type Props = {
  name: string;
};

export function ExistingUserLoginGuidanceEmail({ name }: Props) {
  return (
    // TODO email template
    <Tailwind>
      <Html>
        <Head />
        <Body className='bg-zinc-100 p-[8px]'>
          <Preview>Log in using your existing credentials to access your account.</Preview>
          <Container className='rounded-[4px] border border-solid border-zinc-300 bg-white p-[20px] pb-[5px] font-sans text-zinc-900 shadow'>
            <Img src={`${config.baseUrl}/${config.logoFilename}`} width={48} height={48} />
            <Section>
              <Heading as='h1' className='text-[24px] leading-[32px]'>
                Log in to Your Existing Account
              </Heading>
              <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>Hi {name},</Text>
              <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>
                We received a request related to this email address for {config.appName}. An account
                associated with this email address already exists and is active. If this was you
                trying to sign up again, please log in using your existing credentials:
              </Text>
              <Section className='py-[12px] text-center'>
                <Button
                  href={config.baseUrl + config.loginRoute}
                  className='min-w-[92px] rounded-[4px] bg-amber-500 px-[32px] py-[12px] text-[15px] font-bold text-zinc-700 no-underline'
                >
                  Log In
                </Button>
              </Section>
              <Text className='text-[14px] leading-[16px] text-zinc-500'>
                If you didn&apos;t attempt to sign up or perform this action, you can safely ignore
                this email. Your account remains secure.
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

ExistingUserLoginGuidanceEmail.PreviewProps = {
  name: 'Bartosz Trusiński',
} satisfies Props;

export default ExistingUserLoginGuidanceEmail;
