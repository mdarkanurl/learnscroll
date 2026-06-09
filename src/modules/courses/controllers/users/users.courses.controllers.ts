import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { UsersCoursesServices } from "../../services";

export class UsersCoursesControllers {
    private readonly usersCoursesServices = new UsersCoursesServices();

    async getAllCourses(c: Context) {
        try {
            const courses = await this.usersCoursesServices.getAllCourses();

            return c.json({
                success: true,
                data: courses,
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
