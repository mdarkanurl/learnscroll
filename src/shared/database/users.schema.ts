import { boolean, index, pgTable, text, uuid, varchar } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const profiles = pgTable('profiles', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id, { onDelete: 'cascade' }).notNull(),
    profilePicture: varchar('headline', { length: 60 }),
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

export const privacySettings = pgTable('privacy_settings', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id, { onDelete: 'cascade' }).notNull(),

    // Can your profile other see
    profileStatus: boolean('profile_status').default(true).notNull(),

    // can other see what courses you're taking
    coursesYourTakingStatus: boolean('courses_your_taking_status').default(true).notNull(),
}, (table) => [
    index('userIdIndex_privacy_settings').on(table.userId),
]);
