import { pgTable, text, uniqueIndex, uuid, varchar, type AnyPgColumn } from "drizzle-orm/pg-core";
import { SQL, sql } from "drizzle-orm";


export const users = pgTable('users', {
    id: uuid("id").primaryKey().defaultRandom(),
    firstname: varchar('firstname', { length: 256 }).notNull(),
    lastname: varchar('lastname', { length: 256 }).notNull(),
    email: text('email').notNull(),
    password: text('password').notNull()
}, (table) => [
    uniqueIndex('emailUniqueIndex').on(lower(table.email)),
]);

export function lower(email: AnyPgColumn): SQL {
  return sql`lower(${email})`;
}
