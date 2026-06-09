import type { Context } from "hono";
import { LecturesServices } from "../services/lectures.services";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CreateLectureSchemaDto } from "../dto/create-lecture.dto";

export class LecturesControllers {
    private readonly lecturesServices = new LecturesServices();

    async createLecture(c: Context<any, any, { out: { json: CreateLectureSchemaDto } }>) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const lecture = await this.lecturesServices.createLecture(userId, courseId, sectionId, data);

            return c.json({
                success: true,
                data: lecture,
            }, 201);
        } catch (error) {
            if (error instanceof CustomError) {
                return c.json({
                    success: false,
                    message: error.message,
                }, error.statusCode as ContentfulStatusCode);
            }
            return c.json({
                success: false,
                message: "An unexpected error occurred",
            }, 500);
        }
    }
}
