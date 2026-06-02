import { z } from "zod";

export const sendEmailSchema = z.object({
    email: z.string().email(),
    subject: z.string(),
    body: z.string()
});

export type SendEmailDto = z.infer<typeof sendEmailSchema>
