import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { InstructorsServices } from "../services/instructors.services";

export class InstructorsControllers {
    private readonly instructorsServices = new InstructorsServices();

    async create(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;

            const instructor = await this.instructorsServices.create(userId);

            return c.json({
                success: true,
                data: instructor
            }, 201);
        } catch (error) {
            console.log(error);
            if (error instanceof CustomError) {
                return c.json({
                    success: false,
                    message: error.message
                }, error.statusCode as ContentfulStatusCode);
            }
            return c.json({
                success: false,
                message: "An unexpected error occurred"
            }, 500);
        }
    }
}
