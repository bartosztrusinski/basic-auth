type Props = {
  name: string;
  verificationUrl: string;
  expirationTimeHours: number;
};

// TODO move to config
const APP_NAME = 'Basic Auth';

export function VerificationEmail({ name, verificationUrl, expirationTimeHours }: Props) {
  return (
    <div className='text-gray- mx-auto max-w-[600px] rounded border border-zinc-300 p-5 font-sans leading-relaxed text-zinc-700'>
      <h1>Verify Your Email Address</h1>
      <p>Hi {name},</p>
      <p>
        Thanks for signing up for {APP_NAME}! Please click the button below to verify your email
        address and activate your account.
      </p>
      <p className='my-5 text-center'>
        <a
          href={verificationUrl}
          className='inline-block rounded bg-blue-500 px-6 py-3 font-bold text-white no-underline'
        >
          Verify Email Address
        </a>
      </p>
      <p>This verification link will expire in {expirationTimeHours} hours.</p>
      <p className='mt-5 text-sm text-zinc-500'>
        If you did not sign up for {APP_NAME}, please ignore this email. Your account will not be
        activated.
        <br />
        &copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.
      </p>
    </div>
  );
}
