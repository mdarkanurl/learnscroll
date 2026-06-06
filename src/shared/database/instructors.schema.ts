import { index, pgTable, uuid } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const instructors = pgTable('instructors', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id, { onDelete: 'cascade' }).notNull(),
}, (table) => [
    index('userIdIndex_instructors').on(table.userId),
]);
