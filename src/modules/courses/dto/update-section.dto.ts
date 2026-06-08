import { z } from "zod";

export const UpdateSectionSchema = z.object({
    title: z.string().min(1).trim().optional(),
    order: z.number().int().min(0).optional(),
    objective: z.string().optional(),
}).refine(
    ((data) => Object.keys(data).some((value) => value !== undefined)),
    { message: "At least one field must be provided" }
);

export type UpdateSectionSchemaDto = z.infer<typeof UpdateSectionSchema>;
