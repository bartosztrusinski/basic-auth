import { drizzle } from 'drizzle-orm/neon-http';
import { env } from '@/env';

const db = drizzle(env.DATABASE_URL);
