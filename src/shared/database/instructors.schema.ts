import { pgEnum, pgTable, uniqueIndex, uuid, varchar, timestamp } from "drizzle-orm/pg-core";
import { users } from "./auth.schema";

export const instructors = pgTable('instructors', {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: uuid("userId").references(() => users.id, { onDelete: 'cascade' }).notNull(),

    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").$onUpdate(() => new Date()),
}, (table) => [
    uniqueIndex('userIdIndex_instructors').on(table.userId),
]);

// courses
export const courseCategoryEnumValue = [
  'development',
  'business',
  'finance_and_accounting',
  'it_and_software',
  'office_productivity',
  'personal_development',
  'design',
  'marketing',
  'lifestyle',
  'photography_and_video',
  'health_and_fitness',
  'music',
  'teaching_and_academics',
] as const;

export const courseCategoryEnum = pgEnum('course_category', courseCategoryEnumValue);

export const courseTimeCommitmentEnumValue = [
  'very_busy',
  'side_project',
  'flexible',
  'undecided',
] as const;

export const courseTimeCommitmentEnum = pgEnum('course_time_commitment', courseTimeCommitmentEnumValue);

export const courseStatusEnumValue = [
  'draft',
  'published',
  'archived',
] as const;

export const courseStatusEnum = pgEnum('course_status', courseStatusEnumValue);

export const courses = pgTable('courses', {
    id: uuid("id").primaryKey().defaultRandom(),
    instructorId: uuid('instructorId')
        .references(() => instructors.id, { onDelete: 'cascade' })
        .notNull(),
    title: varchar('title', { length: 256 }),
    category: courseCategoryEnum('category'),
    timeCommitment: courseTimeCommitmentEnum('timeCommitment'),
    status: courseStatusEnum('status').default('draft').notNull(),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").$onUpdate(() => new Date()),
    publishedAt: timestamp('publishedAt'),
});

