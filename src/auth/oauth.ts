import 'server-only';
import { randomBytes } from 'node:crypto';
import { getStateCookie, setStateCookie, deleteStateCookie } from './cookie';

export async function generateState() {
  const state = randomBytes(64).toString('hex');

  await setStateCookie(state);

  return state;
}

export async function validateState(state: string) {
  const storedState = await getStateCookie();

  if (!storedState) {
    return false;
  }

  await deleteStateCookie();

  return state === storedState;
}
