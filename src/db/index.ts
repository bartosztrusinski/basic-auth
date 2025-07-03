import 'server-only';
import { drizzle } from 'drizzle-orm/neon-http';
import { drizzle as drizzleWebSocket } from 'drizzle-orm/neon-serverless';
import { env } from '@/env';
import * as schema from './schema';

type Transaction = Parameters<Parameters<typeof dbWebSocket.transaction>[0]>[0];
export type DbInstance = typeof db | Transaction;

export const db = drizzle(env.DATABASE_URL, { schema, casing: 'snake_case' });
const dbWebSocket = drizzleWebSocket(env.DATABASE_URL, { schema, casing: 'snake_case' });

export const transaction = dbWebSocket.transaction.bind(dbWebSocket);
