import { db, lectures, sections } from "#db";
import { and, eq, sql } from "drizzle-orm";
import CustomError from "#error";


export class UsersLecturesServices {
    private readonly db = db;

    async getLectures(courseId: string, sectionId: string, page: number, limit: number) {
        const [section] = await this.db
            .select({ id: sections.id })
            .from(sections)
            .where(
                and(
                    eq(sections.id, sectionId),
                    eq(sections.courseId, courseId),
                )
            )
            .limit(1);

        if (!section) throw new CustomError("Section not found", 404);

        const offset = (page - 1) * limit;

        const [countResult] = await this.db
            .select({ total: sql<number>`COUNT(*)` })
            .from(lectures)
            .where(eq(lectures.sectionId, sectionId));

        const total = Number(countResult?.total ?? 0);

        const result = await this.db
            .select()
            .from(lectures)
            .where(eq(lectures.sectionId, sectionId))
            .orderBy(lectures.order)
            .limit(limit)
            .offset(offset);

        return {
            lectures: result,
            page,
            limit,
            totalItems: total,
            totalPages: Math.ceil(total / limit),
        };
    }

    async getLecture(courseId: string, sectionId: string, lectureId: string) {
        const [lecture] = await this.db
            .select()
            .from(lectures)
            .innerJoin(sections, eq(lectures.sectionId, sections.id))
            .where(
                and(
                    eq(lectures.id, lectureId),
                    eq(lectures.sectionId, sectionId),
                    eq(sections.courseId, courseId),
                )
            )
            .limit(1);

        if (!lecture) throw new CustomError("Lecture not found", 404);

        return lecture.lectures;
    }
}
