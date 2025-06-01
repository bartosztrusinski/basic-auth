export const callAll =
  <Args extends unknown[]>(...fns: (((...args: Args) => void) | undefined)[]) =>
  (...args: Args) =>
    fns.forEach((fn) => fn && fn(...args));
