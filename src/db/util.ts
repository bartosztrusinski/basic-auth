import 'server-only';
import fs from 'node:fs/promises';

type Data = Record<string, unknown> & {
  expirationTime?: number;
};

type Callback<D extends Data> = (data: D[]) => D[];

const DATA_PATH = `${process.cwd()}/src/data`;

export function createTable<D extends Data>(
  filename: string,
): [() => Promise<D[]>, (callback: Callback<D>) => Promise<void>] {
  const readTable = () => readDb<D>(filename);
  const writeTable = (callback: Callback<D>) => writeToDb(filename, callback);

  return [readTable, writeTable];
}

async function readDb<D extends Data>(filename: string): Promise<D[]> {
  try {
    const rawData = await fs.readFile(`${DATA_PATH}/${filename}`, 'utf-8');
    const data = JSON.parse(rawData) as D[];
    const now = Date.now();
    const nonExpiredData = data.filter((item) =>
      item.expirationTime ? item.expirationTime > now : true,
    );

    return nonExpiredData;
  } catch {
    return [] as D[];
  }
}

async function writeToDb<D extends Data>(filename: string, callback: Callback<D>): Promise<void> {
  const data = await readDb<D>(filename);
  const newData = callback(data);
  await fs.writeFile(`${DATA_PATH}/${filename}`, JSON.stringify(newData, null, 2));
}
