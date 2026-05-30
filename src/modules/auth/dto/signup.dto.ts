import { z } from "zod";

export const SignupSchema = z.object({
    firstname: z.string().min(1, "First name is required").trim(),
    lastname: z.string().min(1, "Last name is required").trim(),
    email: z.string().email("Invalid email address").toLowerCase().trim(),
    password: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
});

export type SignupSchemaDto = z.infer<typeof SignupSchema>;
