import type { Context } from "hono";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AdminSectionsServices } from "../../services";
import type { CreateSectionSchemaDto } from "../../dto/create-section.dto";
import type { UpdateSectionSchemaDto } from "../../dto/update-section.dto";

export class AdminSectionsControllers {
    private readonly adminSectionsServices = new AdminSectionsServices();

    async createSection(c: Context<any, any, { out: { json: CreateSectionSchemaDto } }>) {
        try {
            const courseId = c.req.param("courseId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const section = await this.adminSectionsServices.createSection(userId, courseId, data);

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
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const data = c.req.valid("json");
            const userId = c.get("jwtPayload")?.userId as string;

            const section = await this.adminSectionsServices.updateSection(userId, courseId, sectionId, data);

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

    async deleteSection(c: Context) {
        try {
            const courseId = c.req.param("courseId") as string;
            const sectionId = c.req.param("sectionId") as string;
            const userId = c.get("jwtPayload")?.userId as string;

            const result = await this.adminSectionsServices.deleteSection(userId, courseId, sectionId);

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