import { index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const profiles = pgTable('profiles', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    headline: varchar('headline', { length: 60 }),
    biography: text('biography'),
    language: varchar('language', { length: 10 }),

    // Website
    website: varchar('website', { length: 255 }),

    // Social links
    facebook: varchar('facebook', { length: 255 }),
    instagram: varchar('instagram', { length: 255 }),
    linkedin: varchar('linkedin', { length: 255 }),
    tiktok: varchar('tiktok', { length: 255 }),
    x: varchar('x', { length: 255 }),
    youtube: varchar('youtube', { length: 255 }),
}, (table) => [
    index('userIdIndex_profiles').on(table.userId),
]);
