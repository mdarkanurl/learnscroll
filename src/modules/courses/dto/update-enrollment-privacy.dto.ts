import { enrollmentPrivacyEnumValue } from "#db";
import { z } from "zod";

export const UpdateEnrollmentPrivacySchema = z
    .object({
        enrollmentPrivacy: z.enum(enrollmentPrivacyEnumValue),
        password: z.string().min(6).max(24).optional(),
    })
    .refine(
        (data) => {
            if (data.enrollmentPrivacy === "password_protected") return !!data.password;
            return true;
        },
        { message: "Password is required when enrollment privacy is password_protected", path: ["password"] }
    );

export type UpdateEnrollmentPrivacySchemaDto = z.infer<typeof UpdateEnrollmentPrivacySchema>;
