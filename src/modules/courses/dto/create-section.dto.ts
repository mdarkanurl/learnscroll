import { z } from "zod";

export const CreateSectionSchema = z.object({
    title: z.string().min(1).trim(),
    objective: z.string().optional(),
});

export type CreateSectionSchemaDto = z.infer<typeof CreateSectionSchema>;
