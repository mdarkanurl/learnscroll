import { db, instructors } from "#db";
import CustomError from "#error";
import { DrizzleQueryError, eq } from "drizzle-orm";

export class InstructorsServices {
    private readonly db = db;

    async create(userId: string) {
        try {
            const [instructor] = await this.db
                .insert(instructors)
                .values({ userId })
                .returning({ id: instructors.id });

            return instructor;
        } catch (error) {
            if (error instanceof DrizzleQueryError) {
                if(error.cause?.stack?.includes("instructors_userId_users_id_fk")) throw new CustomError("User does not exist", 404);
                if(error.cause?.stack?.includes("userIdIndex_instructors")) throw new CustomError("User already instructors", 404);
            }
            throw error;
        }
    }
}
