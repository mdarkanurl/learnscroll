import type { Context } from "hono";
import type { CreateCourseSchemaDto } from "../dto/create-course.dto";
import type { UpdateCourseSchemaDto } from "../dto/update-course.dto";
import type { UpdateEnrollmentPrivacySchemaDto } from "../dto/update-enrollment-privacy.dto";
import type { CreateSectionSchemaDto } from "../dto/create-section.dto";
import type { UpdateSectionSchemaDto } from "../dto/update-section.dto";
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

    async createSection(c: Context<any, any, { out: { json: CreateSectionSchemaDto } }>) {
        try {
            const courseId = c.req.param("id") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const section = await this.coursesServices.createSection(userId, courseId, data);

            return c.json({
                success: true,
                data: section,
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

    async updateSection(c: Context<any, any, { out: { json: UpdateSectionSchemaDto } }>) {
        try {
            const courseId = c.req.param("id") as string;
            const sectionId = c.req.param("sectionId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const section = await this.coursesServices.updateSection(userId, courseId, sectionId, data);

            return c.json({
                success: true,
                data: section,
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