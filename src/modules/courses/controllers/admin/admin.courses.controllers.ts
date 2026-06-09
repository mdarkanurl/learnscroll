import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AdminCoursesServices } from "../../services";
import type { CreateCourseSchemaDto } from "../../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../../dto/update-course.dto";
import type { UpdateEnrollmentPrivacySchemaDto } from "../../dto/update-enrollment-privacy.dto";

export class AdminCoursesControllers {
    private readonly adminCoursesServices = new AdminCoursesServices();

    async createCourses(c: Context<any, any, { out: { json: CreateCourseSchemaDto } }>) {
        try {
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const course = await this.adminCoursesServices.createCourses(userId, data);

            return c.json({
                success: true,
                data: course,
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

    async updateCourses(c: Context<any, any, { out: { json: UpdateCourseSchemaDto } }>) {
        try {
            const courseId = c.req.param("id") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const course = await this.adminCoursesServices.updateCourses(userId, courseId, data);

            return c.json({
                success: true,
                data: course,
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

    async archiveCourse(c: Context) {
        try {
            const courseId = c.req.param("id") as string;
            const userId = c.get("jwtPayload")?.userId as string;

            const course = await this.adminCoursesServices.archiveCourse(userId, courseId);

            return c.json({
                success: true,
                data: course,
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

    async updateEnrollmentPrivacy(c: Context<any, any, { out: { json: UpdateEnrollmentPrivacySchemaDto } }>) {
        try {
            const courseId = c.req.param("id") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const course = await this.adminCoursesServices.updateEnrollmentPrivacy(userId, courseId, data);

            return c.json({
                success: true,
                data: course,
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