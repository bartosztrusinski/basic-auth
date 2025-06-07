import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  primaryKey,
  unique,
  timestamp,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { OAuthProviderEnum } from '@/auth/config/providers';

const userIdReference = uuid()
  .notNull()
  .references(() => usersTable.id, { onDelete: 'cascade' });

export const rolesEnum = pgEnum('roles', ['user', 'admin']);
export const usersTable = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp(),
    name: varchar({ length: 255 }).notNull(),
    role: rolesEnum().notNull().default('user'),
    password: varchar({ length: 255 }),
    twoFactorSecret: varchar({ length: 255 }),
  },
  (table) => [uniqueIndex('email_index').on(table.email)],
);

export const providersEnum = pgEnum('providers', OAuthProviderEnum.Values);
export const accountsTable = pgTable(
  'accounts',
  {
    provider: providersEnum().notNull(),
    providerAccountId: varchar({ length: 255 }).notNull(),
    userId: userIdReference,
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    unique().on(table.userId, table.provider),
  ],
);

export const sessionsTable = pgTable('sessions', {
  id: varchar({ length: 43 }).primaryKey(),
  expiresAt: timestamp().notNull(),
  userId: userIdReference,
});

export const verificationTokensTable = pgTable('verification_tokens', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt: timestamp().notNull(),
  userId: userIdReference,
});

export const twoFactorAttemptsTable = pgTable('two_factor_attempts', {
  token: varchar({ length: 86 }).primaryKey(),
  expiresAt: timestamp().notNull(),
  userId: userIdReference,
});

export const twoFactorSetupsTable = pgTable('two_factor_setups', {
  secret: varchar({ length: 64 }).notNull(),
  expiresAt: timestamp().notNull(),
  userId: userIdReference,
});

export const recoveryCodesTable = pgTable(
  'recovery_codes',
  {
    code: varchar({ length: 97 }),
    usedAt: timestamp(),
    userId: userIdReference,
  },
  (table) => [primaryKey({ columns: [table.code, table.userId] })],
);
