export const callAll =
  <Args extends unknown[]>(...fns: (((...args: Args) => void) | undefined)[]) =>
  (...args: Args) =>
    fns.forEach((fn) => fn && fn(...args));

export function formatCode(code: string, { delimiter = '-', blockLength = 4 } = {}) {
  const regex = new RegExp(`.{${blockLength}}(?!$)`, 'g');
  return code.replace(regex, `$&${delimiter}`);
}

export function createExpirationDate(secondsToExpiration: number): Date {
  return new Date(Date.now() + secondsToExpiration * 1000);
}
