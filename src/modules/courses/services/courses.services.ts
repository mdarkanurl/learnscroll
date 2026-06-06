
import { db, courses, instructors } from "#db";
import CustomError from "#error";
import { eq } from "drizzle-orm";
import type { CreateCourseSchemaDto } from "../dto/create-course.dto";

export class CoursesServices {
    private readonly db = db;

    async createCourses(userId: string, data: CreateCourseSchemaDto) {
        const [instructor] = await this.db
            .select({ id: instructors.id })
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        if (!instructor) throw new CustomError("User is not an instructor", 403);

        const [course] = await this.db
            .insert(courses)
            .values({
                instructorId: instructor.id,
                ...data,
            })
            .returning();

        return course;
    }
}