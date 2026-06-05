import { z } from "zod";

export const UpdatePrivacySchema = z.object({
    enabled: z.boolean(),
});

export type UpdatePrivacySchemaDto = z.infer<typeof UpdatePrivacySchema>;
