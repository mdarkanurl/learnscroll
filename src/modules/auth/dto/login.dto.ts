import { z } from "zod";

export const LoginSchema = z.object({
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
});

export type LoginSchemaDto = z.infer<typeof LoginSchema>;
