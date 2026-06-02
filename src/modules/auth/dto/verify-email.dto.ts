import { z } from "zod";

export const VerifyEmailSchema = z.object({
    code: z.number().int("Code must be an integer").min(100000, "Invalid code").max(999999, "Invalid code"),
});

export type VerifyEmailSchemaDto = z.infer<typeof VerifyEmailSchema>;
