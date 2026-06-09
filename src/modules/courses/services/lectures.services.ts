import { courses, db, instructors, lectures, sections } from "#db";
import { and, eq, sql } from "drizzle-orm";
import type { CreateLectureSchemaDto } from "../dto/create-lecture.dto";
import type { UpdateLectureSchemaDto } from "../dto/update-lecture.dto";
import CustomError from "#error";


export class LecturesServices {
    private readonly db = db;

    async createLecture(userId: string, courseId: string, sectionId: string, data: CreateLectureSchemaDto) {
        const [section] = await this.db
            .select({ id: sections.id })
            .from(sections)
            .innerJoin(courses, eq(sections.courseId, courses.id))
            .where(
                and(
                    eq(sections.id, sectionId),
                    eq(sections.courseId, courseId),
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

        if (!section) throw new CustomError("Section not found", 404);

        const [result] = await this.db
            .select({ maxOrder: sql<number>`COALESCE(MAX(${lectures.order}), -1) + 1` })
            .from(lectures)
            .where(eq(lectures.sectionId, sectionId));

        const order = result?.maxOrder ?? 0;

        const [lecture] = await this.db
            .insert(lectures)
            .values({
                sectionId,
                title: data.title,
                order
            })
            .returning();

        return lecture;
    }

    async updateLecture(userId: string, courseId: string, sectionId: string, lectureId: string, data: UpdateLectureSchemaDto) {
        const [lecture] = await this.db
            .select({ id: lectures.id })
            .from(lectures)
            .innerJoin(sections, eq(lectures.sectionId, sections.id))
            .innerJoin(courses, eq(sections.courseId, courses.id))
            .where(
                and(
                    eq(lectures.id, lectureId),
                    eq(lectures.sectionId, sectionId),
                    eq(sections.courseId, courseId),
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

        if (!lecture) throw new CustomError("Lecture not found", 404);

        const [updated] = await this.db
            .update(lectures)
            .set(data)
            .where(eq(lectures.id, lectureId))
            .returning();

        return updated;
    }
}
