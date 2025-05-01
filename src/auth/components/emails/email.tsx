import { type ReactNode } from 'react';
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
  children: ReactNode;
  showLogo?: boolean;
  previewText?: string;
};

export function Email({ children, previewText, showLogo = true }: Props) {
  return (
    <Tailwind>
      <Html>
        <Head />
        <Body className='bg-zinc-100 p-[8px]'>
          {previewText && <Preview>{previewText}</Preview>}
          <Container className='rounded-[4px] border border-solid border-zinc-300 bg-white p-[20px] pb-[5px] font-sans text-zinc-900 shadow'>
            {showLogo && (
              <Img src={`${config.baseUrl}/${config.logoFilename}`} width={48} height={48} />
            )}
            <Section>{children}</Section>
          </Container>
        </Body>
      </Html>
    </Tailwind>
  );
}

Email.Logo = _Logo;
function _Logo() {
  return <Img src={`${config.baseUrl}/${config.logoFilename}`} width={48} height={48} />;
}

Email.Heading = _Heading;
function _Heading({ children }: { children: ReactNode }) {
  return (
    <Heading as='h1' className='text-[24px] leading-[32px]'>
      {children}
    </Heading>
  );
}

Email.Text = _Text;
function _Text({ children }: { children: ReactNode }) {
  return <Text className='font-sans text-[16px] leading-[24px] text-zinc-800'>{children}</Text>;
}

Email.MutedText = _MutedText;
function _MutedText({ children }: { children: ReactNode }) {
  return <Text className='text-[14px] leading-[16px] text-zinc-500'>{children}</Text>;
}

Email.Button = _Button;
function _Button({ children, href }: { children: ReactNode; href: string }) {
  return (
    <Section className='py-[12px] text-center'>
      <Button
        href={href}
        className='min-w-[92px] rounded-[4px] bg-amber-500 px-[32px] py-[12px] text-[15px] font-bold text-zinc-700 no-underline'
      >
        {children}
      </Button>
    </Section>
  );
}

Email.Footer = _Footer;
function _Footer() {
  return (
    <>
      <Hr />
      <Text className='text-center text-[14px] leading-[16px] text-zinc-500'>
        &copy; {new Date().getFullYear()} {config.appName}. All rights reserved.
      </Text>
    </>
  );
}
