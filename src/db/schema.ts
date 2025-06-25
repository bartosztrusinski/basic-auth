import { relations } from 'drizzle-orm';
import {
  pgEnum,
  pgTable,
  uuid,
  varchar,
  primaryKey,
  unique,
  timestamp,
  customType,
} from 'drizzle-orm/pg-core';

const binary = customType<{ data: Buffer; default: false }>({
  dataType() {
    return 'bytea';
  },
});

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
  twoFactorSecret: binary(),
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
  token: binary().primaryKey(),
  expiresAt: timestamp({ withTimezone: true, mode: 'string' }).notNull(),
  userId: userIdRef(),
});

export const verificationTokens = pgTable('verification_tokens', {
  token: binary().primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const twoFactorAttempts = pgTable('two_factor_attempts', {
  token: binary().primaryKey(),
  expiresAt,
  userId: userIdRef(),
});

export const twoFactorSetups = pgTable('two_factor_setups', {
  secret: binary().primaryKey(),
  expiresAt,
  userId: userIdRef().unique(),
});

export const recoveryCodes = pgTable(
  'recovery_codes',
  {
    code: varchar({ length: 97 }).notNull(),
    usedAt: timestamp({ withTimezone: true }),
    userId: userIdRef(),
  },
  (table) => [primaryKey({ columns: [table.code, table.userId] })],
);

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  verificationToken: one(verificationTokens),
  twoFactorSetup: one(twoFactorSetups),
  twoFactorAttempts: many(twoFactorAttempts),
  recoveryCodes: many(recoveryCodes),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
  }),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const verificationTokensRelations = relations(verificationTokens, ({ one }) => ({
  user: one(users, {
    fields: [verificationTokens.userId],
    references: [users.id],
  }),
}));

export const twoFactorSetupsRelations = relations(twoFactorSetups, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorSetups.userId],
    references: [users.id],
  }),
}));

export const twoFactorAttemptsRelations = relations(twoFactorAttempts, ({ one }) => ({
  user: one(users, {
    fields: [twoFactorAttempts.userId],
    references: [users.id],
  }),
}));

export const recoveryCodesRelations = relations(recoveryCodes, ({ one }) => ({
  user: one(users, {
    fields: [recoveryCodes.userId],
    references: [users.id],
  }),
}));
