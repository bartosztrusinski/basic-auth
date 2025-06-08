import { pgEnum, pgTable, uuid, varchar, primaryKey, unique, timestamp } from 'drizzle-orm/pg-core';

const expiresAt = timestamp({ withTimezone: true }).notNull();
const userIdRef = () =>
  uuid()
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' });

export const roles = pgEnum('roles', ['user', 'admin']);
export const users = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: timestamp(),
  name: varchar({ length: 255 }).notNull(),
  role: roles().notNull().default('user'),
  password: varchar({ length: 255 }),
  twoFactorSecret: varchar({ length: 255 }),
  createdAt: timestamp({ withTimezone: true }).notNull().defaultNow(),
});

export const providers = pgEnum('providers', ['discord', 'github', 'google']);
export const accounts = pgTable(
  'accounts',
  {
    provider: providers().notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    userId: userIdRef(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    unique().on(table.userId, table.provider),
  ],
);

export const sessions = pgTable('sessions', {
  id: varchar({ length: 43 }).primaryKey(),
  expiresAt,
  userId: userIdRef(),
});

export const verificationTokens = pgTable('verification_tokens', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const twoFactorAttempts = pgTable('two_factor_attempts', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt,
  userId: userIdRef(),
});

export const twoFactorSetups = pgTable('two_factor_setups', {
  secret: varchar({ length: 64 }).primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const recoveryCodes = pgTable(
  'recovery_codes',
  {
    code: varchar({ length: 97 }).notNull(),
    usedAt: timestamp(),
    userId: userIdRef(),
  },
  (table) => [primaryKey({ columns: [table.code, table.userId] })],
);
