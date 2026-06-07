
import { db, courses, instructors } from "#db";
import CustomError from "#error";
import { and, eq } from "drizzle-orm";
import type { CreateCourseSchemaDto } from "../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../dto/update-course.dto";

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
                ownerId: instructor.id,
                ...data,
            })
            .returning();

        return course;
    }

    async updateCourses(userId: string, courseId: string, data: UpdateCourseSchemaDto) {
        const [updated] = await this.db
            .update(courses)
            .set(data)
            .where(
                and(
                    eq(courses.id, courseId),
                    eq(
                        courses.ownerId,
                        this.db
                            .select({ id: instructors.id })
                            .from(instructors)
                            .where(eq(instructors.userId, userId))
                            .limit(1)
                    )
                )
            )
            .returning();

        if (!updated) throw new CustomError("Course not found or user is not authorized", 404);

        return updated;
    }
}