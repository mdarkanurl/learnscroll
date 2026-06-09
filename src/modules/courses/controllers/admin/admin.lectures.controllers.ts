import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AdminLecturesServices } from "../../services";
import type { CreateLectureSchemaDto } from "../../dto/create-lecture.dto";
import type { UpdateLectureSchemaDto } from "../../dto/update-lecture.dto";

export class AdminLecturesControllers {
    private readonly adminLecturesServices = new AdminLecturesServices();

    async createLecture(c: Context<any, any, { out: { json: CreateLectureSchemaDto } }>) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const lecture = await this.adminLecturesServices.createLecture(userId, courseId, sectionId, data);

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

    async updateLecture(c: Context<any, any, { out: { json: UpdateLectureSchemaDto } }>) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const lectureId = c.req.param("lectureId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const lecture = await this.adminLecturesServices.updateLecture(userId, courseId, sectionId, lectureId, data);

            return c.json({
                success: true,
                data: lecture,
            });
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

    async deleteLecture(c: Context) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const lectureId = c.req.param("lectureId") as string;
            const userId = c.get("jwtPayload")?.userId as string;

            const result = await this.adminLecturesServices.deleteLecture(userId, courseId, sectionId, lectureId);

            return c.json({
                success: true,
                message: result.message,
            });
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
