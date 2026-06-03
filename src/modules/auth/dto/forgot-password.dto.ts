import { z } from "zod";

export const ForgotPasswordSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
});

export type ForgotPasswordSchemaDto = z.infer<typeof ForgotPasswordSchema>;
