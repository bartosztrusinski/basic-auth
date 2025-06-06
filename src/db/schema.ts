import { pgEnum, pgTable, uuid, varchar, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';

export const userRoles = pgEnum('roles', ['user', 'admin']);

export const usersTable = pgTable(
  'users',
  {
    id: uuid().primaryKey().defaultRandom(),
    email: varchar({ length: 255 }).notNull(),
    emailVerified: timestamp(),
    name: varchar({ length: 255 }).notNull(),
    role: userRoles().notNull().default('user'),
    password: varchar({ length: 255 }),
    twoFactorSecret: varchar({ length: 255 }),
  },
  (table) => [uniqueIndex('users_email_index').on(table.email)],
);
