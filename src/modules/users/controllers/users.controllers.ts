import { fileTypeFromBuffer } from 'file-type';
import type { Context } from "hono";
import type { ChangePasswordSchemaDto } from "../dto/change-password.dto";
import type { UpdateProfileSchemaDto } from "../dto/update-profile.dto";
import type { UpdateNameSchemaDto } from "../dto/update-name.dto";
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

    async updateProfilePicture(c: Context) {
        try {
            const userId = c.get("jwtPayload")?.userId;
            const body = await c.req.parseBody();
            const file = body["image"] as File;

            if (!file || !(file instanceof File)) return c.json({
                success: false,
                message: "Image file is required"
            }, 400);

            if(Array.isArray(file)) return c.json({
                success: false,
                message: "Only one image is allowed"
            }, 400);

            const buffer = Buffer.from(await file.arrayBuffer());

            // check image size
            if(buffer.length > 1024 * 1024) return c.json({
                success: false,
                message: "Image size exceeds 1 MB"
            }, 400);

            // check file type
            const fileType = await fileTypeFromBuffer(buffer);

            if (!fileType) return c.json({
                success: false,
                message: "Invalid file"
            }, 400);

            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/webp',
            ];

            if (!allowedTypes.includes(fileType.mime)) return c.json({
                success: false,
                message: "Unsupported image format"
            }, 400);

            const result = await this.userServices.updateProfilePicture(userId, buffer);

            return c.json({
                success: true,
                data: result
            });
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

    async updateName(c: Context<any, any, { out: { json: UpdateNameSchemaDto } }>) {
        try {
            const email = c.get("jwtPayload")?.email;
            const data = c.req.valid("json");
            const user = await this.userServices.updateName(email, data);

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

    async updateProfile(c: Context<any, any, { out: { json: UpdateProfileSchemaDto } }>) {
        try {
            const userId = c.get("jwtPayload")?.userId;
            const data = c.req.valid("json");
            const profile = await this.userServices.updateProfile(userId, data);
            console.log(profile)

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
