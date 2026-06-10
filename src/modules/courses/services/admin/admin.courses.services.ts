
import { db, courses, instructors } from "#db";
import CustomError from "#error";
import { and, eq, sql, ilike, asc, desc } from "drizzle-orm";
import type { CreateCourseSchemaDto } from "../../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../../dto/update-course.dto";
import type { UpdateEnrollmentPrivacySchemaDto } from "../../dto/update-enrollment-privacy.dto";
import type { QueryCoursesSchemaDto } from "../../dto/query-courses.dto";

export class AdminCoursesServices {
    private readonly db = db;

    async getAllCourses(userId: string, query: QueryCoursesSchemaDto) {
        const { page, limit, search, category, timeCommitment, status, sort } = query;
        const offset = (page - 1) * limit;

        const [instructor] = await this.db
            .select({ id: instructors.id })
            .from(instructors)
            .where(eq(instructors.userId, userId))
            .limit(1);

        if (!instructor) throw new CustomError("User is not an instructor", 403);

        const conditions: any[] = [eq(courses.ownerId, instructor.id)];

        if (search) conditions.push(ilike(courses.title, `%${search}%`));
        if (category) conditions.push(eq(courses.category, category));
        if (timeCommitment) conditions.push(eq(courses.timeCommitment, timeCommitment));
        if (status) conditions.push(eq(courses.status, status));

        const where = conditions.length > 0 ? and(...conditions) : undefined;

        const [countResult] = await this.db
            .select({ total: sql<number>`COUNT(*)` })
            .from(courses)
            .where(where);

        const total = Number(countResult?.total ?? 0);

        const orderBy = (() => {
            switch (sort) {
                case "oldest": return asc(courses.createdAt);
                case "a-z": return asc(courses.title);
                case "z-a": return desc(courses.title);
                case "published_first": return sql`CASE WHEN ${courses.status} = 'published' THEN 0 ELSE 1 END`;
                case "unpublished_first": return sql`CASE WHEN ${courses.status} = 'unpublished' THEN 0 ELSE 1 END`;
                default: return desc(courses.createdAt);
            }
        })();

        const result = await this.db
            .select()
            .from(courses)
            .where(where)
            .orderBy(orderBy)
            .limit(limit)
            .offset(offset);

        return {
            courses: result,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        };
    }

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
