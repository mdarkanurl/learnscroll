import { courses, db, instructors, sections } from "#db";
import { and, eq, exists, sql } from "drizzle-orm";
import type { CreateSectionSchemaDto } from "../dto/create-section.dto";
import CustomError from "#error";
import type { UpdateSectionSchemaDto } from "../dto/update-section.dto";


export class SectionsServices {
    private readonly db = db;

    async createSection(userId: string, courseId: string, data: CreateSectionSchemaDto) {
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

        const [result] = await this.db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${sections.order}), -1) + 1` })
            .from(sections)
            .where(eq(sections.courseId, courseId));

        const order = result?.maxOrder ?? 0;

        const [section] = await this.db
            .insert(sections)
            .values({
                courseId,
                title: data.title,
                order,
                objective: data.objective,
            })
            .returning();

        return section;
    }

    async updateSection(userId: string, courseId: string, sectionId: string, data: UpdateSectionSchemaDto) {
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
            .update(sections)
            .set(data)
            .where(
                and(
                    eq(sections.id, sectionId),
                    eq(sections.courseId, courseId),
                )
            )
            .returning();

        if (!updated) throw new CustomError("Section not found", 404);

        return updated;
    }

    async deleteSection(userId: string, courseId: string, sectionId: string) {
        const [deleted] = await this.db
            .delete(sections)
            .where(
                and(
                    eq(sections.id, sectionId),
                    eq(sections.courseId, courseId),
                    exists(
                        this.db
                            .select({ id: sql`1` })
                            .from(courses)
                            .innerJoin(instructors, eq(courses.ownerId, instructors.id))
                            .where(
                                and(
                                    eq(courses.id, courseId),
                                    eq(instructors.userId, userId)
                                )
                            )
                    )
                )
            )
            .returning({ id: sections.id, order: sections.order });

        if (!deleted) throw new CustomError("Section not found", 404);

        await this.db
            .update(sections)
            .set({ order: sql`${sections.order} - 1` })
            .where(
                and(
                    eq(sections.courseId, courseId),
                    sql`${sections.order} > ${deleted.order}`
                )
            );

        return { message: "Section deleted successfully" };
    }
}
