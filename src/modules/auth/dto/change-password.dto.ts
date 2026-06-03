import { z } from "zod";

export const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
    newPassword: z.string().min(8, "Password must be at least 8 characters long").trim()
        .refine((val) => !val.includes(" "), {
            message: "String cannot contain spaces"
        }),
    }).refine((data) => data.currentPassword !== data.newPassword, {
        message: "New password must be different from current password"
    });

export type ChangePasswordSchemaDto = z.infer<typeof ChangePasswordSchema>;
