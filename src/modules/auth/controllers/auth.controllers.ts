import type { Context } from "hono";
import type { ContentfulStatusCode } from "hono/utils/http-status";
import { AuthServices } from "../services/auth.services";
import type { SignupSchemaDto } from "../dto/signup.dto";
import CustomError from "#error";
import { setCookie } from "hono/cookie";

export class AuthControllers {
    constructor(
        private readonly authServices = new AuthServices()
    ) {
        this.authServices = authServices;
    }

    async signup(c: Context<any, any, { out: { json: SignupSchemaDto } }>) {
        try {
            const userInput = c.req.valid("json");
        
            const response = await this.authServices.signup(userInput);

            if(typeof response === "string") 
                return c.json({
                    success: true,
                    message: response
                });

            setCookie(c, 'verify_email_token', response.token, {
                path: '/verify-email',
                secure: true,
                httpOnly: true,
                maxAge: 1000,
                expires: new Date(Date.now() + 15 * 60 * 1000),
                sameSite: 'Strict',
            });
            
            return c.json({
                success: true,
                message: response.message
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
