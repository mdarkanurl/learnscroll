import { z } from "zod";

export const ResetPasswordSchema = z.object({
    code: z.number().int("Code must be an integer").min(100000, "Invalid code").max(999999, "Invalid code"),
    newPassword: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
});

export type ResetPasswordSchemaDto = z.infer<typeof ResetPasswordSchema>;
