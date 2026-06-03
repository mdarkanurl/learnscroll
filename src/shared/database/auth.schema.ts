import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar, type AnyPgColumn } from "drizzle-orm/pg-core";
import { SQL, sql } from "drizzle-orm";


export const users = pgTable('users', {
    id: uuid("id").primaryKey().defaultRandom(),
    firstname: varchar('firstname', { length: 256 }).notNull(),
    lastname: varchar('lastname', { length: 256 }).notNull(),
    email: text('email').notNull(),
    password: text('password').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp("updated_at").$onUpdate(() => new Date()),
}, (table) => [
    uniqueIndex('emailUniqueIndex').on(lower(table.email)),
]);

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}

export const refresh_tokens = pgTable('refresh_tokens', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id).notNull(),
    tokenHash: text("tokenHash").notNull(),
    expiresAt: timestamp("expiresAt").notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    lastUsedAt: timestamp("lastUsedAt"),
    revokedAt: timestamp("revokedAt")
}, (table) => [
    index('userIdIndex').on(table.userId),
]);
