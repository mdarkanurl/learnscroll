import { z } from "zod";

export const enableMFASchema = z.object({
    enabled: z.boolean(),
});

export type enableMFASchemaDto = z.infer<typeof enableMFASchema>;
