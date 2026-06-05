import { z } from "zod";

export const UpdateProfileSchema = z.object({
    headline: z.string().max(60).optional(),
    biography: z.string().optional(),
    language: z.string().max(10).optional(),
    website: z.string().max(255).optional(),
    facebook: z.string().max(255).optional(),
    instagram: z.string().max(255).optional(),
    linkedin: z.string().max(255).optional(),
    tiktok: z.string().max(255).optional(),
    x: z.string().max(255).optional(),
    youtube: z.string().max(255).optional(),
}).refine(
    (data) => Object.values(data).some((value) => value !== undefined),
    { message: "At least one field must be provided" }
);

export type UpdateProfileSchemaDto = z.infer<typeof UpdateProfileSchema>;
