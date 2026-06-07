import type { Context } from "hono";
import type { CreateCourseSchemaDto } from "../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../dto/update-course.dto";
import type { UpdateEnrollmentPrivacySchemaDto } from "../dto/update-enrollment-privacy.dto";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { CoursesServices } from "../services/courses.services";

export class CoursesControllers {
    private readonly coursesServices = new CoursesServices();

    async createCourses(c: Context<any, any, { out: { json: CreateCourseSchemaDto } }>) {
        try {
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const course = await this.coursesServices.createCourses(userId, data);

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

            const course = await this.coursesServices.updateCourses(userId, courseId, data);

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

            const course = await this.coursesServices.archiveCourse(userId, courseId);

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

            const course = await this.coursesServices.updateEnrollmentPrivacy(userId, courseId, data);

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