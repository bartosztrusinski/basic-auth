import { pgEnum, pgTable, uuid, varchar, primaryKey, unique, timestamp } from 'drizzle-orm/pg-core';

const expiresAt = timestamp({ withTimezone: true }).notNull();
const userIdRef = () =>
  uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' });

export const rolesEnum = pgEnum('roles', ['user', 'admin']);
export const usersTable = pgTable('users', {
  id: uuid().primaryKey().defaultRandom(),
  email: varchar({ length: 255 }).notNull().unique(),
  emailVerified: timestamp(),
  name: varchar({ length: 255 }).notNull(),
  role: rolesEnum().notNull().default('user'),
  password: varchar({ length: 255 }),
  twoFactorSecret: varchar({ length: 255 }),
});

export const providersEnum = pgEnum('providers', ['discord', 'github', 'google']);
export const accountsTable = pgTable(
  'accounts',
  {
    provider: providersEnum().notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    userId: userIdRef(),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    unique().on(table.userId, table.provider),
  ],
);

export const sessionsTable = pgTable('sessions', {
  id: varchar({ length: 43 }).primaryKey(),
  expiresAt,
  userId: userIdRef(),
});

export const verificationTokensTable = pgTable('verification_tokens', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const twoFactorAttemptsTable = pgTable('two_factor_attempts', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt,
  userId: userIdRef(),
});

export const twoFactorSetupsTable = pgTable('two_factor_setups', {
  secret: varchar({ length: 64 }).primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const recoveryCodesTable = pgTable(
  'recovery_codes',
  {
    code: varchar({ length: 97 }).notNull(),
    usedAt: timestamp(),
    userId: userIdRef(),
  },
  (table) => [primaryKey({ columns: [table.code, table.userId] })],
);
