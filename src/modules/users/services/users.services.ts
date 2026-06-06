import { db, refresh_tokens, users, profiles, privacySettings } from "#db";
import CustomError from "#error";
import bcrypt from "bcryptjs";
import { sql, eq, getTableColumns } from "drizzle-orm";
import type { UpdateProfileSchemaDto } from "../dto/update-profile.dto";
import type { UpdateNameSchemaDto } from "../dto/update-name.dto";
import { uploadImage } from '#cloudinary';


export class UserServices {
    private readonly db = db;

    async changePassword(email: string, currentPassword: string, newPassword: string): Promise<string> {
        const [user] = await this.db
            .select()
            .from(users)
            .where(sql`lower(${users.email}) = lower(${email})`)
            .limit(1);

        if (!user) throw new CustomError("User not found", 404);

        const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
        if (!isPasswordValid) throw new CustomError("Current password is incorrect", 401);

        const hashedPassword = await bcrypt.hash(newPassword, 10);

        await this.db.update(users)
            .set({ password: hashedPassword })
            .where(sql`lower(${users.email}) = lower(${email})`);

        return "Password changed successfully";
    }

    async enableMfa(enabled: boolean, userId: string, email: string) {
        const [user] = await this.db
            .select({ id: users.id })
            .from(users)
            .where(eq(users.email, email))
            .limit(1);

        if (!user) throw new CustomError("User not found", 404);

        await this.db.update(users)
        .set({ mfaEnabled: enabled })
        .where(eq(users.email, email));

        await this.db.update(refresh_tokens)
            .set({ revokedAt: new Date() })
            .where(eq(refresh_tokens.userId, userId));

        return "Multi-factor authentication enabled";
    }

    async getPrivacySetting(userId: string, field: 'profileStatus' | 'coursesYourTakingStatus'):
    Promise<{ profile_status: boolean } | { courses_visible_status: boolean }> {
        const [setting] = await this.db
            .select()
            .from(privacySettings)
            .where(eq(privacySettings.userId, userId))
            .limit(1);

        if(setting) return field === "profileStatus"?
        { profile_status: setting.profileStatus } :
        { courses_visible_status: setting.coursesYourTakingStatus };

        const [res] =  await this.db
            .insert(privacySettings)
            .values({ userId })
            .returning({
                profile_status: privacySettings.profileStatus,
                courses_visible_status: privacySettings.coursesYourTakingStatus
            });

        return field === "profileStatus"?
        { profile_status: res?.profile_status! } :
        { courses_visible_status: res?.courses_visible_status! };
    }

    async updatePrivacySetting(
        userId: string,
        field: 'profileStatus' | 'coursesYourTakingStatus',
        value: boolean
    ): Promise<{ profile_status: boolean } | { courses_visible_status: boolean }> {
        const [existing] = await this.db
            .select({ id: privacySettings.id })
            .from(privacySettings)
            .where(eq(privacySettings.userId, userId))
            .limit(1);

        if (field === 'profileStatus') {
            if (!existing) {
                const [setting] = await this.db
                    .insert(privacySettings)
                    .values({ userId, profileStatus: value })
                    .returning({ profile_status: privacySettings.profileStatus });

                return setting!;
            }

            const [updated] = await this.db
                .update(privacySettings)
                .set({ profileStatus: value })
                .where(eq(privacySettings.userId, userId))
                .returning({ profile_status: privacySettings.profileStatus });

            return updated!;
        }

        if (!existing) {
            const [setting] = await this.db
                .insert(privacySettings)
                .values({ userId, coursesYourTakingStatus: value })
                .returning({ courses_visible_status: privacySettings.coursesYourTakingStatus });

            return setting!;
        }

        const [updated] = await this.db
            .update(privacySettings)
            .set({ coursesYourTakingStatus: value })
            .where(eq(privacySettings.userId, userId))
            .returning({ courses_visible_status: privacySettings.coursesYourTakingStatus });

        return updated!;
    }

    async updateProfilePicture(userId: string, buffer: Buffer) {
        const url = await uploadImage(buffer, "profile_picture");

        const [existing] = await this.db
            .select({ id: profiles.id })
            .from(profiles)
            .where(eq(profiles.userId, userId))
            .limit(1);

        if (!existing) {
            const [profile] = await this.db
                .insert(profiles)
                .values({ userId, profilePicture: url })
                .returning({ profilePicture: profiles.profilePicture });

            return profile;
        }

        const [updated] = await this.db
            .update(profiles)
            .set({ profilePicture: url })
            .where(eq(profiles.userId, userId))
            .returning({ profilePicture: profiles.profilePicture });

        return updated;
    }

    async updateName(email: string, data: UpdateNameSchemaDto) {
        const [updated] = await this.db
            .update(users)
            .set(data)
            .where(eq(users.email, email))
            .returning({
                firstname: users.firstname,
                lastname: users.lastname
            });

        return updated;
    }

    async updateProfile(userIdFromReq: string, data: UpdateProfileSchemaDto) {
        const { id, userId, ...rest } = getTableColumns(profiles);

        const [existing] = await this.db
            .select({ id: profiles.id })
            .from(profiles)
            .where(eq(profiles.userId, userIdFromReq))
            .limit(1);

        if (!existing) {
            const [profile] = await this.db
                .insert(profiles)
                .values({ userId: userIdFromReq, ...data })
                .returning(rest);

            return profile;
        }

        const [updated] = await this.db
            .update(profiles)
            .set(data)
            .where(eq(profiles.userId, userIdFromReq))
            .returning(rest);

        return updated;
    }

    async me(userId: string) {
        const [user] = await this.db
            .select({
                email: users.email,
                firstname: users.firstname,
                lastname: users.lastname
            })
            .from(users)
            .where(sql`${users.id} = ${userId}`)
            .limit(1);

        if (!user) throw new CustomError("User not found", 404);

        return user;
    }

    async profiles(userIdFromReq: string) {
        const { id, userId, ...rest } = getTableColumns(profiles);

        const [profile] = await this.db
            .select(rest)
            .from(profiles)
            .where(sql`${profiles.userId} = ${userIdFromReq}`)
            .limit(1);
        
        // get name of users
        const [user] = await this.db
            .select({
                firstname: users.firstname,
                lastname: users.lastname
            })
            .from(users)
            .where(sql`${users.id} = ${userIdFromReq}`)
            .limit(1);

        if (profile) return { ...user, ...profile };

        const [newProfile] = await this.db
            .insert(profiles)
            .values({ userId: userIdFromReq })
            .returning();

        return { ...user, ...newProfile };
    }
}
