import 'server-only';
import { createTable } from '@/db/util';
import { type User } from '@/db/user';

type VerificationToken = {
  email: User['email'];
  token: string;
  expirationTime: number;
};

const [getVerificationTokens, writeVerificationTokens] = createTable<VerificationToken>(
  'verification-tokens.json',
);

async function getVerificationTokenByEmail(email: VerificationToken['email']) {
  const verificationTokens = await getVerificationTokens();
  return verificationTokens.find((token) => token.email === email);
}

async function getVerificationTokenByToken(token: VerificationToken['token']) {
  const verificationTokens = await getVerificationTokens();
  return verificationTokens.find((verificationToken) => verificationToken.token === token);
}

async function createVerificationToken(newToken: VerificationToken) {
  await writeVerificationTokens((tokens) => {
    const isExistingToken = tokens.some(({ token }) => token === newToken.token);

    if (isExistingToken) {
      throw new Error('Token already exists');
    }

    return [...tokens, newToken];
  });

  return newToken;
}

async function deleteVerificationToken(email: VerificationToken['email']) {
  await writeVerificationTokens((tokens) => tokens.filter((token) => token.email !== email));
}

export {
  getVerificationTokens,
  getVerificationTokenByEmail,
  getVerificationTokenByToken,
  createVerificationToken,
  deleteVerificationToken,
};
export type { VerificationToken };
