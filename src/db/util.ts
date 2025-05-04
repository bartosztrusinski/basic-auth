import 'server-only';
import fs from 'node:fs/promises';

const DATA_PATH = `${process.cwd()}/src/data`;

export function createTable<T>(
  filename: string,
): [() => Promise<T[]>, (data: T[]) => Promise<void>] {
  const readTable = async () => readDb<T>(filename);
  const writeTable = async (data: T[]) => writeToDb(filename, data);

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

async function writeToDb(filename: string, data: unknown[]): Promise<void> {
  await fs.writeFile(`${DATA_PATH}/${filename}`, JSON.stringify(data, null, 2));
}
