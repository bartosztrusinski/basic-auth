import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/env';
import * as schema from './schema';

export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' });

type Transaction = Parameters<Parameters<typeof db.transaction>[0]>[0];
export type DbInstance = typeof db | Transaction;
