import { pgEnum, pgTable, uniqueIndex, uuid, varchar, timestamp, text, integer, boolean, json } from "drizzle-orm/pg-core";
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
  'under_review',
  'unpublished',
] as const;

export const courseStatusEnum = pgEnum('course_status', courseStatusEnumValue);

export const enrollmentPrivacyEnumValue = [
  "public",
  "invitation_only",
  "password_protected"
] as const;

export const enrollmentPrivacyEnum = pgEnum("enrollment_privacy", enrollmentPrivacyEnumValue);

export const courses = pgTable('courses', {
    id: uuid("id").primaryKey().defaultRandom(),
    ownerId: uuid('ownerId')
        .references(() => instructors.id, { onDelete: 'cascade' })
        .notNull(),
    instructors: text("instructors").array().notNull().default([]),
    title: varchar('title', { length: 256 }),
    category: courseCategoryEnum('category'),
    timeCommitment: courseTimeCommitmentEnum('timeCommitment'),
    status: courseStatusEnum('status').default('draft').notNull(),
    learningObjectives: text("learning_objectives").array().notNull().default([]),
    prerequisites: text("prerequisites").array().notNull().default([]),
    intendedLearners: text("intended_learners").array().notNull().default([]),
    enrollmentPrivacy: enrollmentPrivacyEnum("enrollment_privacy").default("public").notNull(),
    password: text("password"), // this will use when the course enrollment privacy is password_protected
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp("updatedAt").$onUpdate(() => new Date()),
    publishedAt: timestamp('publishedAt'),
});

export const sections = pgTable("sections", {
  id: uuid("id").primaryKey().defaultRandom(),
  courseId: uuid("courseId")
    .references(() => courses.id, { onDelete: "cascade" })
    .notNull(),
  title: text("title").notNull(),
  order: integer("order").notNull(),
  objective: text("objective"),
});

export const lectureContentTypeEnumValue = [
  "video",
  "video_slide_mashup",
  "article",
] as const;

export const lectureContentTypeEnum = pgEnum("lecture_content_type", lectureContentTypeEnumValue);

export const lectures = pgTable("lectures", {
  id: uuid("id").primaryKey().defaultRandom(),
  sectionId: uuid("sectionId")
    .references(() => sections.id, { onDelete: "cascade" })
    .notNull(),
  title: varchar("title", { length: 80 }).notNull(),
  order: integer("order").notNull(),
  description: text("description"),
});

export const lectureContent = pgTable("lecture_content", {
  id: uuid("id").primaryKey().defaultRandom(),
  lectureId: uuid("lectureId")
    .references(() => sections.id, { onDelete: "cascade" })
    .notNull(),
  
  contentType: lectureContentTypeEnum("content_type").notNull(),
  isDownloadable: boolean("is_downloadable").default(false).notNull(),
  videoUrl: text("video_url"),
  duration: integer("duration"),
  slideUrl: text("slide_url"),
  article: text("article"),
});

export const lecturesResourcesTypeValue = [
  "Downloadable_file",
  "external_resource",
  "sourec_code"
] as const;

export const lecturesResourcesTypeEnum = pgEnum("lectures_resources_type", lectureContentTypeEnumValue);

export const lecturesResources = pgTable("lectures_resources", {
  id: uuid("id").primaryKey().defaultRandom(),
  lectureId: uuid("lectureId")
    .references(() => lectures.id, { onDelete: "cascade" })
    .notNull(),

  types: lectureContentTypeEnum("types"),
  downloadableFilePath: text("downloadable_file_path"),
  externalResource: json().$type<{ Title: string, Url: string }>().array().notNull().default([]),
  sourecCodeFilePath: text("sourec_code_file_path"),
});
