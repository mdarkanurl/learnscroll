import type { Context } from "hono";
import type { ChangePasswordSchemaDto } from "../dto/change-password.dto";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { UserServices } from "../services/users.services";

export class UsersControllers {
    private readonly userServices = new UserServices();

    async changePassword(c: Context<any, any, { out: { json: ChangePasswordSchemaDto } }>) {
        try {
            const { currentPassword, newPassword } = c.req.valid("json");
            const userEmail = c.get("jwtPayload")?.email;

            const response = await this.userServices.changePassword(userEmail, currentPassword, newPassword);

            return c.json({
                success: true,
                message: response
            });
        } catch (error) {
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

    async me(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;
            const user = await this.userServices.me(userId);

            return c.json({
                success: true,
                data: user
            });
        } catch (error) {
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

    async profiles(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;
            const profile = await this.userServices.profiles(userId);

            return c.json({
                success: true,
                data: profile
            });
        } catch (error) {
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
