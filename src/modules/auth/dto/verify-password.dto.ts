import { z } from "zod";

export const VerifyPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
});

export type VerifyPasswordSchemaDto = z.infer<typeof VerifyPasswordSchema>;
