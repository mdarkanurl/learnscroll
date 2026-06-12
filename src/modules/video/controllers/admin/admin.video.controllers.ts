import type { Context } from "hono";
import { AdminVideoServices } from "../../services";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { GenerateSignatureDto } from "../../dto/admin/admin.generate-signature.dto";

export class AdminVideoControllers {
    private readonly adminVideoServices = new AdminVideoServices();

    async generateSignature(c: Context<any, any, { out: { json: GenerateSignatureDto } }>) {
        try {
            const userId = c.get("jwtPayload")?.userId as string;
            const data = c.req.valid("json");

            const res = await this.adminVideoServices
                .generateSignature(userId, data);

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
