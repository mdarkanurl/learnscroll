import { courseCategoryEnumValue, courseTimeCommitmentEnumValue } from "#db";
import { z } from "zod";

export const UpdateCourseSchema = z.object({
    title: z.string().min(1).max(256).trim().optional(),
    category: z.enum(courseCategoryEnumValue).optional(),
    timeCommitment: z.enum(courseTimeCommitmentEnumValue).optional(),
    learningObjectives: z.array(z.string()).optional(),
    prerequisites: z.array(z.string()).optional(),
    intendedLearners: z.array(z.string()).optional(),
}).refine(
    (data) => Object.keys(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
);

export type UpdateCourseSchemaDto = z.infer<typeof UpdateCourseSchema>;
