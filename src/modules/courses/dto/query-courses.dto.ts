import { courseCategoryEnumValue, courseStatusEnumValue, courseTimeCommitmentEnumValue } from "#db";
import { z } from "zod";

export const courseSortEnumValue = [
    "newest",
    "oldest",
    "a-z",
    "z-a",
    "published_first",
    "unpublished_first",
] as const;

export const QueryCoursesSchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    category: z.enum(courseCategoryEnumValue).optional(),
    timeCommitment: z.enum(courseTimeCommitmentEnumValue).optional(),
    status: z.enum(courseStatusEnumValue).optional(),
    sort: z.enum(courseSortEnumValue).default("newest"),
});

export type QueryCoursesSchemaDto = z.infer<typeof QueryCoursesSchema>;
