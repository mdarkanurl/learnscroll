import type { Context } from "hono";
import { AdminVideoServices } from "../../services";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";

export class AdminVideoControllers {
    private readonly adminVideoServices = new AdminVideoServices();

    async generateSignature(c: Context) {
        try {
            const userEmail = c.get("jwtPayload")?.email as string;

            const res = await this.adminVideoServices
                .generateSignature(userEmail);

            return c.json({
                success: true,
                data: res
            });
        } catch (error) {
            console.log(error)
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
