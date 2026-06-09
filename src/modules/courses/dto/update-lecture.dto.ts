import { z } from "zod";

export const UpdateLectureSchema = z.object({
    title: z.string().min(1).max(80).trim().optional(),
    order: z.number().int().min(0).optional(),
    description: z.string().optional(),
}).refine(
    ((data) => Object.keys(data).some((value) => value !== undefined)),
    { message: "At least one field must be provided" }
);

export type UpdateLectureSchemaDto = z.infer<typeof UpdateLectureSchema>;
