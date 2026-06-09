import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { UsersLecturesServices } from "../../services";

export class UserLecturesControllers {
    private readonly usersLecturesServices = new UsersLecturesServices();

    async getLectures(c: Context) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const page = Math.max(Number(c.req.query("page")) || 1, 1);
            const limit = Math.min(
                Math.max(Number(c.req.query("limit")) || 100, 1),
                100
            );

            const result = await this.usersLecturesServices.getLectures(courseId, sectionId, page, limit);

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

            const lecture = await this.usersLecturesServices.getLecture(courseId, sectionId, lectureId);

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
}
