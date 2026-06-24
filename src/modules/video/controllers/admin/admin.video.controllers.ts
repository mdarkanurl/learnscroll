import type { Context } from "hono";
import { AdminVideoServices } from "../../services";
import CustomError from "#error";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import type { GenerateSignatureDto } from "../../dto/admin/admin.generate-signature.dto";
import { verifyNotificationSignature } from "#cloudinary";

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

    async webhook(c: Context) {
        try {
            const signature = c.req.header("X-Cld-Signature");
            const timestamp = c.req.header("X-Cld-Timestamp");

            if (!signature || !timestamp) return c.json({
                    success: false,
                    message: "Missing Cloudinary headers"
                }, 400);

            const rawBody = await c.req.text();

            const isValidReq = verifyNotificationSignature(
                rawBody,
                Number(timestamp),
                signature,
            );

            if(!isValidReq) return c.json({
                success: false,
                message: "Invalid signature"
            }, 400);

            await this.adminVideoServices.webhook(JSON.parse(rawBody));

            return c.json({
                success: true,
                data: null
            })
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
