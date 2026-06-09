import type { Context } from "hono";
import { LecturesServices } from "../services/lectures.services";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { CreateLectureSchemaDto } from "../dto/create-lecture.dto";
import type { UpdateLectureSchemaDto } from "../dto/update-lecture.dto";

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

    async updateLecture(c: Context<any, any, { out: { json: UpdateLectureSchemaDto } }>) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const lectureId = c.req.param("lectureId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const lecture = await this.lecturesServices.updateLecture(userId, courseId, sectionId, lectureId, data);

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

    async getLectures(c: Context) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const page = Math.max(Number(c.req.query("page")) || 1, 1);
            const limit = Math.min(
                Math.max(Number(c.req.query("limit")) || 100, 1),
                100
            );

            const result = await this.lecturesServices.getLectures(courseId, sectionId, page, limit);

            return c.json({
                success: true,
                data: result.lectures,
                pagination: {
                    page: result.page,
                    limit: result.limit,
                    totalItem: result.totalItems,
                    totalPages: result.totalPages
                },
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

    async getLecture(c: Context) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const lectureId = c.req.param("lectureId") as string;

            const lecture = await this.lecturesServices.getLecture(courseId, sectionId, lectureId);

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

            const result = await this.lecturesServices.deleteLecture(userId, courseId, sectionId, lectureId);

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
