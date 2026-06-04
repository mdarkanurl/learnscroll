import { db, users } from "#db";
import CustomError from "#error";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";


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
}
