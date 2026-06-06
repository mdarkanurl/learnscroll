import { courseCategoryEnumValue, courseTimeCommitmentEnumValue } from "#db";
import { z } from "zod";

export const CreateCourseSchema = z.object({
    title: z.string().min(1).max(256).trim().optional(),
    category: z.enum(courseCategoryEnumValue).optional(),
    timeCommitment: z.enum(courseTimeCommitmentEnumValue).optional(),
});

export type CreateCourseSchemaDto = z.infer<typeof CreateCourseSchema>;
