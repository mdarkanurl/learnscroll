
import { db, courses, instructors } from "#db";
import CustomError from "#error";
import { and, eq } from "drizzle-orm";
import type { CreateCourseSchemaDto } from "../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../dto/update-course.dto";
import type { UpdateEnrollmentPrivacySchemaDto } from "../dto/update-enrollment-privacy.dto";

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

    async archiveCourse(userId: string, courseId: string) {
        const [course] = await this.db
            .select({ status: courses.status })
            .from(courses)
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
            .limit(1);

        if (!course) throw new CustomError("Course not found", 404);
        if (course.status !== "published") throw new CustomError("Only published courses can be archived", 400);

        const [archived] = await this.db
            .update(courses)
            .set({ status: "unpublished" })
            .where(eq(courses.id, courseId))
            .returning();

        return archived;
    }

    async updateEnrollmentPrivacy(userId: string, courseId: string, data: UpdateEnrollmentPrivacySchemaDto) {
        const [course] = await this.db
            .select({ id: courses.id })
            .from(courses)
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
            .limit(1);

        if (!course) throw new CustomError("Course not found", 404);

        const [updated] = await this.db
            .update(courses)
            .set(data)
            .where(eq(courses.id, courseId))
            .returning();

        return updated;
    }
}