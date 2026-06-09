import { z } from "zod";

export const CreateLectureSchema = z.object({
    title: z.string().min(1).max(80).trim(),
});

export type CreateLectureSchemaDto = z.infer<typeof CreateLectureSchema>;
