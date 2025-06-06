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
    userId: uuid()
      .notNull()
      .references(() => usersTable.id, { onDelete: 'cascade' }),
  },
  (table) => [
    primaryKey({ columns: [table.provider, table.providerAccountId] }),
    unique().on(table.provider, table.providerAccountId),
    unique().on(table.userId, table.provider),
  ],
);

export const sessionsTable = pgTable('sessions', {
  id: varchar({ length: 43 }).primaryKey(),
  expiresAt: timestamp().notNull(),
  userId: uuid()
    .notNull()
    .references(() => usersTable.id, { onDelete: 'cascade' }),
});
