import { z } from "zod";

export const UpdateNameSchema = z.object({
    firstname: z.string().min(1).max(256).optional(),
    lastname: z.string().min(1).max(256).optional(),
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
);

export type UpdateNameSchemaDto = z.infer<typeof UpdateNameSchema>;
