import 'server-only';
import fs from 'node:fs/promises';

type Callback<T> = (data: T[]) => T[];

const DATA_PATH = `${process.cwd()}/src/data`;

export function createTable<T>(
  filename: string,
): [() => Promise<T[]>, (callback: Callback<T>) => Promise<void>] {
  const readTable = () => readDb<T>(filename);
  const writeTable = (callback: Callback<T>) => writeToDb(filename, callback);

  return [readTable, writeTable];
}

async function readDb<T>(filename: string): Promise<T[]> {
  try {
    const data = await fs.readFile(`${DATA_PATH}/${filename}`, 'utf-8');
    return JSON.parse(data) as T[];
  } catch {
    return [] as T[];
  }
}

async function writeToDb<T>(filename: string, callback: Callback<T>): Promise<void> {
  const data = await readDb<T>(filename);
  const newData = callback(data);
  await fs.writeFile(`${DATA_PATH}/${filename}`, JSON.stringify(newData, null, 2));
}
