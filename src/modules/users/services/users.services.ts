import { db, users, profiles } from "#db";
import CustomError from "#error";
import bcrypt from "bcryptjs";
import { sql, getTableColumns } from "drizzle-orm";


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
